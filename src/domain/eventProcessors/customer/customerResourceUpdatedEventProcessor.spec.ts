import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { CustomerResourceUpdatedEventProcessor } from './customerResourceUpdatedEventProcessor';
import { getSampleCustomerResourceUpdatedMessage } from '../../../test/testData/ctCustomerMessages';
import { getCustomerProfile } from '../../ctService';
import { getKlaviyoProfileByExternalId } from '../../klaviyoService';
import { getSampleCustomerApiResponse } from '../../../test/testData/ctCustomerApi';
import mocked = jest.mocked;

jest.mock('../../ctService');
jest.mock('../../klaviyoService');
describe('CustomerResourceUpdatedEventProcessor > isEventValid', () => {
    it('should return valid when the customer event has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'customer' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'notificationType', { value: 'ResourceUpdated' });

        const event = CustomerResourceUpdatedEventProcessor.instance(ctMessageMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | notificationType
        ${'invalid'}  | ${'ResourceUpdated'}
        ${'customer'} | ${'invalid'}
    `(
        'should return invalid when is not a valid customer ResourceUpdated message',
        ({ resource, notificationType }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
            Object.defineProperty(ctMessageMock, 'notificationType', { value: notificationType });

            const event = CustomerResourceUpdatedEventProcessor.instance(ctMessageMock);

            exp(event.isEventValid()).to.be.false;
        },
    );
});

describe('CustomerResourceUpdatedEventProcessor > generateKlaviyoEvent', () => {
    it('should generate the klaviyo event when the input customer ResourceUpdated event is valid', async () => {
        const inputMessage = getSampleCustomerResourceUpdatedMessage();
        const message = inputMessage as unknown as MessageDeliveryPayload;
        const event = CustomerResourceUpdatedEventProcessor.instance(message);
        const getCustomerProfileMock = mocked(getCustomerProfile);
        getCustomerProfileMock.mockResolvedValue(getSampleCustomerApiResponse());
        const getKlaviyoProfileMock = mocked(getKlaviyoProfileByExternalId);
        getKlaviyoProfileMock.mockResolvedValue({ type: 'profile', id: 'someId', attributes: {} });

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });
});
