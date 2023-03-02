import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { mock, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { CustomerFirstNameSetEventProcessor } from './customerFirstNameSetEventProcessor';
import { getSampleCustomerFirstNameSetMessage } from '../../../../test/testData/ctCustomerMessages';
import { Context } from "../../../../types/klaviyo-context";

const context: Context = mock<Context>();

describe('CustomerFirstNameSetEventProcessor > isEventValid', () => {
    it('should return valid when the customer name set event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'customer' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'CustomerFirstNameSet' });

        const event = CustomerFirstNameSetEventProcessor.instance(ctMessageMock, context);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | type
        ${'invalid'}  | ${'CustomerFirstNameSet'}
        ${'customer'} | ${'invalid'}
    `('should return invalid when is not a valid customer first name set message', ({ resource, type }) => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
        Object.defineProperty(ctMessageMock, 'type', { value: type });

        const event = CustomerFirstNameSetEventProcessor.instance(ctMessageMock, context);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('CustomerFirstNameSetEventProcessor > generateKlaviyoEvent', () => {
    it('should generate the klaviyo event when the input customer first name set event is valid', async () => {
        const inputMessage = getSampleCustomerFirstNameSetMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerFirstNameSetEventProcessor.instance(message, context);

        const klaviyoEvent = await event.generateKlaviyoEvents();
        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });
});
