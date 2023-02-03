import { expect as exp } from 'chai';
import { mockDeep } from 'jest-mock-extended';
import { OrderRefundedEvent } from './orderRefundedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { ctAuthNock, ctGetOrderByIdNock } from '../../test/integration/nocks/commercetoolsNock';
import * as ctService from '../ctService';

describe('orderRefundedEvent > isEventValid', () => {
    it('should return valid when order has refunded items', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'order',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'ReturnInfoSet' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'returnInfo', {
            value: [
                {
                    items: [
                        {
                            paymentState: 'Refunded',
                        },
                    ],
                },
            ],
        }); //mock readonly property

        const event = OrderRefundedEvent.instance(ctMessageMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource     | type
        ${'invalid'} | ${'ReturnInfoSet'}
        ${'order'}   | ${'invalid'}
    `('should return invalid when is not a ReturnInfoSet message', async ({ resource, type }) => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: { typeId: resource, id: '3456789' },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: type }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'returnInfo', {
            value: [
                {
                    items: [
                        {
                            paymentState: 'Refunded',
                        },
                    ],
                },
            ],
        }); //mock readonly property

        const event = OrderRefundedEvent.instance(ctMessageMock);

        exp(event.isEventValid()).to.be.false;
    });

    it('should return invalid when the order does not have refunded items', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'order',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'ReturnInfoSet' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'returnInfo', {
            value: [
                {
                    items: [
                        {
                            paymentState: 'Other',
                        },
                    ],
                },
            ],
        }); //mock readonly property
        ctAuthNock();
        ctGetOrderByIdNock('3456789');

        const event = OrderRefundedEvent.instance(ctMessageMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('orderRefundedEvent > generateKlaviyoEvent', () => {
    it("should not generate klaviyo events if it can't find the order in commercetools", async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'order',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'ReturnInfoSet' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'orderState', { value: 'Cancelled' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'returnInfo', {
            value: [
                {
                    items: [
                        {
                            paymentState: 'Refunded',
                        },
                    ],
                },
            ],
        }); //mock readonly property
        jest.spyOn(ctService, 'getOrderById').mockResolvedValueOnce(undefined);

        const event = OrderRefundedEvent.instance(ctMessageMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(0);
    });

    it('should generate the klaviyo event for an order refunded message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'order',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'ReturnInfoSet' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'orderState', { value: 'Cancelled' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'returnInfo', {
            value: [
                {
                    items: [
                        {
                            paymentState: 'Refunded',
                        },
                    ],
                },
            ],
        }); //mock readonly property
        ctAuthNock();
        ctGetOrderByIdNock('3456789');

        const event = OrderRefundedEvent.instance(ctMessageMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });
});
