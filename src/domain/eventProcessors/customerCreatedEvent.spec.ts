import { CustomerCreatedEvent } from './customerCreatedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended';
import { expect } from 'chai';
import { jest } from '@jest/globals';

describe('customerCreatedEvent', () => {
    it('should return valid when the resource type is `customer`', async () => {
        const event = new CustomerCreatedEvent();

        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'customer' } }); //mock readonly property
        expect(event.isEventValid(ctMessageMock)).to.be.true;
    });

    it('should return not valid when the resource type is not `customer`', async () => {
        const event = new CustomerCreatedEvent();

        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'invalidType' } }); //mock readonly property
        expect(event.isEventValid(ctMessageMock)).to.be.false;
    });

    it('should process the event', async () => {
        const event = new CustomerCreatedEvent();
        console.log(process.env.KLAVIYO_AUTH_KEY);

        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'invalidType' } }); //mock readonly property
        await event.process(ctMessageMock);
        // use nock to check api calls
    });
});
