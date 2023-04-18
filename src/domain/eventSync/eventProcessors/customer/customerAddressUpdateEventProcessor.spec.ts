import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { CustomerAddressUpdateEventProcessor } from './customerAddressUpdateEventProcessor';
import { getSampleCustomerAddressUpdateMessage } from '../../../../test/testData/ctCustomerMessages';
import { getSampleCustomerApiResponse } from '../../../../test/testData/ctCustomerApi';
import { Context } from "../../../../types/klaviyo-context";

const ctCustomerServiceMock = {
    getCustomerProfile: jest.fn(),
}

jest.mock('../../../../infrastructure/driven/commercetools/DefaultCtCustomerService', () => ({
    DefaultCtCustomerService: function() {
        return ctCustomerServiceMock;
    }
}));

jest.mock('../../../../infrastructure/driven/commercetools/ctService');
const contextMock: DeepMockProxy<Context> = mockDeep<Context>();
describe('CustomerAddressUpdateEventProcessor > isEventValid', () => {
    it.each`
        type
        ${'CustomerAddressAdded'}
        ${'CustomerAddressRemoved'}
        ${'CustomerAddressChanged'}
    `('should return valid when the message type is $type', ({ type }) => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'customer' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: type });

        const event = CustomerAddressUpdateEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | type
        ${'invalid'}  | ${'CustomerAddressUpdate'}
        ${'customer'} | ${'invalid'}
    `('should return invalid when is not a valid customer address update message', ({ resource, type }) => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
        Object.defineProperty(ctMessageMock, 'type', { value: type });

        const event = CustomerAddressUpdateEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('CustomerAddressUpdateEventProcessor > generateKlaviyoEvent', () => {
    it('should generate the klaviyo event when the customer address update event is valid', async () => {
        const inputMessage = getSampleCustomerAddressUpdateMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerAddressUpdateEventProcessor.instance(message, contextMock);
        contextMock.ctCustomerService.getCustomerProfile.mockResolvedValue(getSampleCustomerApiResponse());

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });

    it("should set the profile location to null in Klaviyo if CT doesn't return and address", async () => {
        const inputMessage = getSampleCustomerAddressUpdateMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerAddressUpdateEventProcessor.instance(message, contextMock);
        contextMock.ctCustomerService.getCustomerProfile.mockResolvedValue(getSampleCustomerApiResponse([]));

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });
});
