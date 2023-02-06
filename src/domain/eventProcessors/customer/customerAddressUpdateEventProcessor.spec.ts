import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { CustomerAddressUpdateEventProcessor } from './customerAddressUpdateEventProcessor';
import { getSampleCustomerAddressUpdateMessage } from '../../../test/testData/ctCustomerMessages';
import { getCustomerProfile } from '../../ctService';
import { getSampleCustomerApiResponse } from '../../../test/testData/ctCustomerApi';
import mocked = jest.mocked;

jest.mock('../../ctService');
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

        const event = CustomerAddressUpdateEventProcessor.instance(ctMessageMock);

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

        const event = CustomerAddressUpdateEventProcessor.instance(ctMessageMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('CustomerAddressUpdateEventProcessor > generateKlaviyoEvent', () => {
    it('should generate the klaviyo event when the customer address update event is valid', async () => {
        const inputMessage = getSampleCustomerAddressUpdateMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerAddressUpdateEventProcessor.instance(message);
        const getCustomerProfileMock = mocked(getCustomerProfile);
        getCustomerProfileMock.mockResolvedValue(getSampleCustomerApiResponse());

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });

    it("should set the profile location to null in Klaviyo if CT doesn't return and address", async () => {
        const inputMessage = getSampleCustomerAddressUpdateMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerAddressUpdateEventProcessor.instance(message);
        const getCustomerProfileMock = mocked(getCustomerProfile);
        getCustomerProfileMock.mockResolvedValue(getSampleCustomerApiResponse([]));

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });

    it('should return an empty array if the customer profile is not found in CT', async () => {
        const inputMessage = getSampleCustomerAddressUpdateMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerAddressUpdateEventProcessor.instance(message);
        const getCustomerProfileMock = mocked(getCustomerProfile);
        getCustomerProfileMock.mockResolvedValue(undefined);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(0);
    });
});
