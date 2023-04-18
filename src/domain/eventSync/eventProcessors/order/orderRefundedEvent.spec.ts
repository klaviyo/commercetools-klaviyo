import { expect as exp } from 'chai';
import { DeepMockProxy, mock, mockDeep } from "jest-mock-extended";
import { OrderRefundedEvent } from './orderRefundedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import {
    ctAuthNock,
    ctGetPaymentByIdNock,
    ctGetOrderByPaymentIdNock,
} from '../../../../test/integration/nocks/commercetoolsNock';
import * as ctService from '../../../../infrastructure/driven/commercetools/ctService';
import { Context } from "../../../../types/klaviyo-context";
import { sampleOrderCreatedMessage } from '../../../../test/testData/orderData';

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();
const eventRequestMock = mock<EventRequest>();
const mockedOrderId = "mockedOrder";
eventRequestMock.data.id = mockedOrderId;
contextMock.orderMapper.mapCtRefundedOrderToKlaviyoEvent.mockImplementation((order, metric, time) => eventRequestMock);

describe('orderRefundedEvent > isEventValid', () => {
    it('should return valid when a payment transaction has type "Refund" (PaymentTransactionAdded)', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'payment',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'PaymentTransactionAdded' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'transaction', {
            value: {
                type: 'Refund',
                state: 'Initial',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'state', { value: null }); //mock readonly property

        const event = OrderRefundedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it('should return valid when a payment transaction has type "Refund" (PaymentTransactionStateChanged)', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'payment',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'PaymentTransactionStateChanged' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'transaction', { value: null }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'state', { value: 'Success' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'transactionId', { value: '123456' }); //mock readonly property

        const event = OrderRefundedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource     | type                                | transactionId | transaction | state
        ${'invalid'} | ${'PaymentTransactionAdded'}        | ${null}       | ${null}     | ${null}
        ${'payment'} | ${'invalid'}                        | ${'123456'}   | ${null}     | ${null}
        ${'invalid'} | ${'PaymentTransactionStateChanged'} | ${'123456'}   | ${null}     | ${'Success'}
    `(
        'should return invalid when is not a valid Payment Transaction message',
        async ({ resource, type, transactionId, transaction, state }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', {
                value: { typeId: resource, id: '3456789' },
            }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'type', { value: type }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'transaction', { value: transaction }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'transactionId', { value: transactionId }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'state', { value: state }); //mock readonly property

            const event = OrderRefundedEvent.instance(ctMessageMock, contextMock);

            exp(event.isEventValid()).to.be.false;
        },
    );
});

describe('orderRefundedEvent > generateKlaviyoEvent', () => {
    it('should not generate klaviyo events if the transaction is undefined', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'payment',
                id: '123456',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'PaymentTransactionAdded' }); //mock readonly property
        contextMock.ctPaymentService.getPaymentById.mockResolvedValueOnce({
            id: '123456',
            createdAt: '2023-02-08T13:57:16.045Z',
            lastModifiedAt: '2023-02-08T13:57:16.045Z',
            paymentStatus: {},
            transactions: [],
        } as any);
        contextMock.ctOrderService.getOrderByPaymentId.mockResolvedValue(sampleOrderCreatedMessage.order);

        const event = OrderRefundedEvent.instance(ctMessageMock, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(0);
        expect(contextMock.orderMapper.mapCtRefundedOrderToKlaviyoEvent).toBeCalledTimes(0);
    });

    it('should generate klaviyo events for a PaymentTransactionAdded message', async () => {
        // recorder.rec();
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'payment',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'PaymentTransactionAdded' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'transaction', {
            value: [
                {
                    id: '123456',
                    type: 'Refund',
                    state: 'Initial',
                },
            ],
        }); //mock readonly property

        contextMock.ctPaymentService.getPaymentById.mockResolvedValueOnce({
            id: '123456',
            createdAt: '2023-02-08T13:57:16.045Z',
            lastModifiedAt: '2023-02-08T13:57:16.045Z',
            paymentStatus: {},
            transactions: [],
        } as any);
        contextMock.ctOrderService.getOrderByPaymentId.mockResolvedValue(sampleOrderCreatedMessage.order);

        const event = OrderRefundedEvent.instance(ctMessageMock, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.orderMapper.mapCtRefundedOrderToKlaviyoEvent).toBeCalledTimes(1);
        exp(klaviyoEvent[0].body.data.id).to.eq("mockedOrder");
    });
});
