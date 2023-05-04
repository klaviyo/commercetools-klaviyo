import { expect as exp } from 'chai';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { OrderStateChangedEvent } from './orderStateChangedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { Context } from '../../../../types/klaviyo-context';

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();
const orderEventRequestMock = mock<EventRequest>();
const mockedOrderId = 'mockedOrderId';
orderEventRequestMock.data.id = mockedOrderId;
const lineEventRequestMock = mock<EventRequest>();
const mockedOrderLineId = 'mockedOrderLineId';
lineEventRequestMock.data.id = mockedOrderLineId;
contextMock.orderMapper.mapCtOrderToKlaviyoEvent.mockImplementation((order, metric, time) => orderEventRequestMock);
contextMock.orderMapper.mapOrderLineToProductOrderedEvent.mockImplementation((lineItem, order) => lineEventRequestMock);

describe('orderStateChangedEvent > isEventValid', () => {
    it('should return valid when order is in Cancelled state', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'order',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderStateChanged' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'orderState', { value: 'Cancelled' }); //mock readonly property

        const event = OrderStateChangedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource     | type
        ${'invalid'} | ${'OrderStateChanged'}
        ${'order'}   | ${'invalid'}
        ${'order'}   | ${'OrderStateChanged'}
    `('should return invalid when is not an OrderStateChanged message', async ({ resource, type }) => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: { typeId: resource, id: '3456789' },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: type }); //mock readonly property

        const event = OrderStateChangedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.false;
    });

    it('should return invalid when the orderState is invalid', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'order',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderStateChanged' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'orderState', { value: 'FakeState' }); //mock readonly property

        const event = OrderStateChangedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('orderStateChangedEvent > generateKlaviyoEvent', () => {
    it("should not generate klaviyo events if it can't find the order in commercetools", async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'order',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderStateChanged' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'orderState', { value: 'Cancelled' }); //mock readonly property
        contextMock.ctOrderService.getOrderById.mockResolvedValueOnce(undefined);
        contextMock.ctProductService.getProductsByIdRange.mockResolvedValueOnce({
            data: [],
            hasMore: false,
        });

        const event = OrderStateChangedEvent.instance(ctMessageMock, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(0);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(0);
        expect(contextMock.orderMapper.mapOrderLineToProductOrderedEvent).toBeCalledTimes(0);
    });

    it('should generate the klaviyo event for an order state changed message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', {
            value: {
                typeId: 'order',
                id: '3456789',
            },
        }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderStateChanged' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'orderState', { value: 'Cancelled' }); //mock readonly property

        contextMock.ctOrderService.getOrderById.mockResolvedValueOnce({
            customerId: '123-123-123',
            customerEmail: 'test@klaviyo.com',
            id: `3456789`,
            version: 24,
            createdAt: '2023-01-27T15:00:00.000Z',
            lastModifiedAt: '2023-01-27T15:00:00.000Z',
            lineItems: [],
            customLineItems: [],
            totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
            shipping: [],
            shippingMode: 'Single',
            orderState: 'Open',
            syncInfo: [],
            origin: 'Customer',
            refusedGifts: [],
        });
        contextMock.ctProductService.getProductsByIdRange.mockResolvedValueOnce({
            data: [],
            hasMore: false,
        });

        const event = OrderStateChangedEvent.instance(ctMessageMock, contextMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledTimes(1);
        expect(contextMock.orderMapper.mapCtOrderToKlaviyoEvent).toBeCalledWith(
            expect.anything(),
            [],
            'Cancelled Order',
            false,
            '2023-01-27T15:00:00.000Z',
        );
        exp(klaviyoEvent[0].body.data.id).to.eq(mockedOrderId);
    });
});
