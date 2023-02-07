import { expect as exp } from 'chai';
import { mockDeep } from 'jest-mock-extended';
import { OrderStateChangedEvent } from './orderStateChangedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { ctAuthNock, ctGetOrderByIdNock } from '../../../test/integration/nocks/commercetoolsNock';
import * as ctService from '../../ctService';

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

        const event = OrderStateChangedEvent.instance(ctMessageMock);

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

        const event = OrderStateChangedEvent.instance(ctMessageMock);

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

        const event = OrderStateChangedEvent.instance(ctMessageMock);

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
        jest.spyOn(ctService, 'getOrderById').mockResolvedValueOnce(undefined);

        ctAuthNock();

        const event = OrderStateChangedEvent.instance(ctMessageMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(0);
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

        ctAuthNock();
        ctGetOrderByIdNock('3456789');

        const event = OrderStateChangedEvent.instance(ctMessageMock);
        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });
});
