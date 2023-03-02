import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { mock, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { CustomerTitleSetEventProcessor } from './customerTitleSetEventProcessor';
import { getSampleCustomerTitleSetMessage } from '../../../../test/testData/ctCustomerMessages';
import { Context } from "../../../../types/klaviyo-context";

const context: Context = mock<Context>();

describe('CustomerTitleSetEventProcessor > isEventValid', () => {
    it('should return valid when the customer name set event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'customer' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'CustomerTitleSet' });

        const event = CustomerTitleSetEventProcessor.instance(ctMessageMock, context);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | type
        ${'invalid'}  | ${'CustomerTitleSet'}
        ${'customer'} | ${'invalid'}
    `('should return invalid when is not a valid customer title set message', ({ resource, type }) => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
        Object.defineProperty(ctMessageMock, 'type', { value: type });

        const event = CustomerTitleSetEventProcessor.instance(ctMessageMock, context);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('CustomerTitleSetEventProcessor > generateKlaviyoEvent', () => {
    it('should generate the klaviyo event when the input customer title set event is valid', async () => {
        const inputMessage = getSampleCustomerTitleSetMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerTitleSetEventProcessor.instance(message, context);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });
});
