import { expect as exp } from 'chai';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { OrderCreatedEvent } from './orderCreatedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { ctAuthNock, ctGetOrderByIdNock } from '../../../../test/integration/nocks/commercetoolsNock';
import { Context } from '../../../../types/klaviyo-context';
import { sampleOrderCreatedMessage } from '../../../../test/testData/orderData';

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();
const orderEventRequestMock = mock<EventRequest>();
const mockedOrderId = 'mockedOrderId';
orderEventRequestMock.data.id = mockedOrderId;
const lineEventRequestMock = mock<EventRequest>();
const mockedOrderLineId = 'mockedOrderLineId';
lineEventRequestMock.data.id = mockedOrderLineId;
contextMock.orderMapper.mapCtOrderToKlaviyoEvent.mockImplementation((order, metric, time) => orderEventRequestMock);
contextMock.orderMapper.mapOrderLineToProductOrderedEvent.mockImplementation((lineItem, order) => lineEventRequestMock);

describe('orderCreatedEvent > isEventValid', () => {
    it('should return valid when is an Imported message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderImported' });
        Object.defineProperty(ctMessageMock, 'order', { value: { customerId: '123-1230-123', orderState: 'Open' } });
        Object.defineProperty(ctMessageMock, 'payloadNotIncluded', {
            value: null,
        });

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it('should return valid when is an OrderCreated message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'order', { value: { customerId: '123-1230-123', orderState: 'Open' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'payloadNotIncluded', {
            value: null,
        });

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it('should return valid when payloadNotIncluded is set', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'payloadNotIncluded', {
            value: {
                payloadType: 'OrderCreated',
                reason: 'Example reason',
            },
        });

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource     | type                  | order                             | customer
        ${'invalid'} | ${'OrderCreated'}     | ${{ customerId: '123-1230-123' }} | ${null}
        ${'order'}   | ${'invalid'}          | ${{}}                             | ${null}
        ${'order'}   | ${'OrderCreated'}     | ${null}                           | ${null}
        ${'order'}   | ${'OrderCustomerSet'} | ${null}                           | ${null}
    `(
        'should return invalid when is not an orderCreated message, resource: $resource type: $type',
        ({ resource, type, order, customer }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'type', { value: type }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'order', { value: order }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'customer', { value: customer }); //mock readonly property

            const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

            exp(event.isEventValid()).to.be.false;
        },
    );

    it('should return invalid when the orderState is invalid', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'order', {
            value: { customerId: '123-1230-123', orderState: 'FakeState' },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'customer', { value: null }); //mock readonly property

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('orderCreatedEvent > generateKlaviyoEvent', () => {
    it('should generate the klaviyo event for an OrderCreated message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        const order = {
            customerId: '123-123-123',
            customerEmail: 'test@klaviyo.com',
            orderState: 'Open',
            totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
            createdAt: '2023-01-27T15:00:00.000Z',
            lineItems: [],
            customLineItems: [],
        };
        Object.defineProperty(ctMessageMock, 'order', { value: order }); //mock readonly property
        contextMock.ctProductService.getProductsByIdRange.mockResolvedValueOnce({
            data: [],
            hasMore: false,
        });

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(1);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(1);
        expect(contextMock.orderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(0);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledWith(order, [], 'Placed Order', true);
        exp(klaviyoEvent[0].body.data.id).to.eq(mockedOrderId);
    });

    it('should generate the klaviyo event for an OrderCreated message when order is not in the message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        contextMock.ctOrderService.getOrderById.mockResolvedValue(sampleOrderCreatedMessage.order);
        contextMock.ctProductService.getProductsByIdRange.mockResolvedValueOnce({
            data: [],
            hasMore: false,
        });

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(1);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(1);
        expect(contextMock.orderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(0);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledWith(
            sampleOrderCreatedMessage.order,
            [],
            'Placed Order',
            true,
        );
        exp(klaviyoEvent[0].body.data.id).to.eq(mockedOrderId);
    });

    it('should generate the klaviyo events for line items in an OrderCreated message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        const order = {
            customerId: '123-123-123',
            customerEmail: 'test@klaviyo.com',
            orderState: 'Open',
            createdAt: '2023-01-27T15:00:00.000Z',
            totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
            lineItems: [
                {
                    id: '123-123-123',
                    totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
                    name: {
                        en: 'Test product',
                    },
                },
            ],
        };
        Object.defineProperty(ctMessageMock, 'order', {
            value: order,
        }); //mock readonly property

        contextMock.ctProductService.getProductsByIdRange.mockResolvedValueOnce({
            data: [],
            hasMore: false,
        });

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        const klaviyoEvents = await event.generateKlaviyoEvents();

        exp(klaviyoEvents).to.not.be.undefined;
        exp(klaviyoEvents.length).to.eq(2);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(1);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledWith(order, [], 'Placed Order', true);
        expect(contextMock.orderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(1);
        expect(contextMock.orderMapper.mapOrderLineToProductOrderedEvent).toBeCalledWith(order.lineItems[0], order);
        exp(klaviyoEvents[0].body.data.id).to.eq(mockedOrderId);
        exp(klaviyoEvents[1].body.data.id).to.eq(mockedOrderLineId);
    });

    it('should generate the klaviyo event for an OrderCustomerSet message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order', id: '123123123' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCustomerSet' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'customer', {
            value: {
                typeId: 'customer',
                id: '123123123',
            },
        }); //mock readonly property

        ctAuthNock();
        ctGetOrderByIdNock('123123123');

        contextMock.ctProductService.getProductsByIdRange.mockResolvedValueOnce({
            data: [],
            hasMore: false,
        });

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(1);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(1);
        // expect(contextMock.currencyService.convert).toBeCalledWith(13, 'USD');
        exp(klaviyoEvent[0].body.data.id).to.eq(mockedOrderId);
    });
});
