import { CustomerCreatedEvent } from './customerCreatedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { mockDeep } from 'jest-mock-extended';
import { expect } from 'chai';

describe('customerCreatedEvent', () => {
    it('should return valid when the resource type is `customer`', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'customer' } }); //mock readonly property

        const event = CustomerCreatedEvent.instance(ctMessageMock);

        expect(event.isEventValid()).to.be.true;
    });

    it('should return not valid when the resource type is not `customer`', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'invalidType' } }); //mock readonly property

        const event = CustomerCreatedEvent.instance(ctMessageMock);

        expect(event.isEventValid()).to.be.false;
    });

    it('should process the event', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        const event = CustomerCreatedEvent.instance(ctMessageMock);

        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'invalidType' } }); //mock readonly property
        await event.generateKlaviyoEvent();
        // use nock to check api calls
    });
});
