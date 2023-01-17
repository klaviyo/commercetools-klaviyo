import { expect } from 'chai';
import { mockDeep } from 'jest-mock-extended';
import { OrderCreatedEvent } from './orderCreatedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';

describe('orderCreatedEvent', () => {
    it('should return valid when is an orderCreated message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'order', { value: {} }); //mock readonly property

        const event = OrderCreatedEvent.instance(ctMessageMock);

        expect(event.isEventValid()).to.be.true;
    });

    it.each`
        resource     | type              | order
        ${'invalid'} | ${'OrderCreated'} | ${{}}
        ${'order'}   | ${'invalid'}      | ${{}}
        ${'order'}   | ${'OrderCreated'} | ${null}
    `('should return invalid when is not an orderCreated message', ({ resource, type, order }) => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: type }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'order', { value: order }); //mock readonly property

        const event = OrderCreatedEvent.instance(ctMessageMock);

        expect(event.isEventValid()).to.be.false;
    });
});
