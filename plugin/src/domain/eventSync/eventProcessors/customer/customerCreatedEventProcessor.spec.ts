import { CustomerCreatedEventProcessor } from './customerCreatedEventProcessor';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { getSampleCustomerCreatedMessage } from '../../../../test/testData/ctCustomerMessages';
import { Context } from '../../../../types/klaviyo-context';
import { DefaultCustomerMapper } from '../../../shared/mappers/DefaultCustomerMapper';
import { getSampleCustomerApiResponse } from '../../../../test/testData/ctCustomerApi';
import { GetProfileResponseData } from 'klaviyo-api';

jest.mock('../../../../infrastructure/driven/klaviyo/KlaviyoService');
const contextMock: DeepMockProxy<Context> = mockDeep<Context>();

contextMock.customerMapper.mapCtCustomerToKlaviyoProfile.mockImplementation(
    (customer, klaviyoProfileId) => (new DefaultCustomerMapper()).mapCtCustomerToKlaviyoProfile(customer, klaviyoProfileId),
);


describe('customerCreatedEvent > isEventValid', () => {
    beforeEach(() => {
        contextMock.klaviyoService.getKlaviyoProfileByExternalId.mockResolvedValue(undefined);
    });

    it('should return valid when the customer created resource has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'customer' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'CustomerCreated' });
        Object.defineProperty(ctMessageMock, 'customer', { value: { email: 'some@email.com' } });

        const event = CustomerCreatedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource      | type                 | customer
        ${'invalid'}  | ${'CustomerCreated'} | ${{ email: 'someemail@klaviyo.com' }}
        ${'customer'} | ${'invalid'}         | ${{ email: 'someemail@klaviyo.com' }}
        ${'customer'} | ${'CustomerCreated'} | ${null}
    `('should return invalid when is not a valid customer created message', ({ resource, type, customer }) => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } });
        Object.defineProperty(ctMessageMock, 'type', { value: type });
        Object.defineProperty(ctMessageMock, 'customer', { value: customer });

        const event = CustomerCreatedEventProcessor.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('customerCreatedEvent > generateKlaviyoEvent', () => {
    beforeEach(() => {
        contextMock.klaviyoService.getKlaviyoProfileByExternalId.mockResolvedValue(undefined);
    });
    it('should generate the klaviyo create profile event when the input customer created event is valid', async () => {
        const message = getSampleCustomerCreatedMessage();
        message.customer.addresses.splice(0, message.customer.addresses.length);
        message.customer.addresses.push({
            id: '1235aa3a-5417-4b51-a76c-d6721472531f',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '+4407476588266',
            postalCode: 'WE1 2DP',
            streetName: 'High Road',
            streetNumber: '23',
            additionalStreetInfo: 'private access',
            building: 'Tall Tower',
            apartment: 'C',
            additionalAddressInfo: 'additional address info',
            state: 'a state',
        });
        const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledWith(message.customer);
        expect(klaviyoEvent[0]).toMatchSnapshot();
    });

    it('should generate the klaviyo create profile event getting the customer from CT when is not included in the message', async () => {
        const message: any = {
            ...getSampleCustomerCreatedMessage(),
        };
        delete message.customer;
        contextMock.ctCustomerService.getCustomerProfile.mockResolvedValue(getSampleCustomerApiResponse());
        const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledWith(getSampleCustomerApiResponse());
        expect(contextMock.ctCustomerService.getCustomerProfile).toBeCalledTimes(1);
        expect(klaviyoEvent[0]).toMatchSnapshot();
    });

    it('should generate the klaviyo create profile event with the default billing address when is available', async () => {
        const message = getSampleCustomerCreatedMessage();
        message.customer.addresses.splice(0, message.customer.addresses.length);
        message.customer.addresses.push({
            id: 'delivery-address-id',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '+4407476588266',
            postalCode: 'SE1 5XG',
            streetName: 'some road',
            streetNumber: '23',
            additionalStreetInfo: 'private access',
            building: 'Tall Tower',
            apartment: 'C',
            additionalAddressInfo: 'additional address info',
            state: 'a state',
        });
        message.customer.addresses.push({
            id: 'billing-address-id',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '+4407476588266',
            postalCode: 'WS2 5FX',
            streetName: "I'm the default billing address",
            streetNumber: '23',
            additionalStreetInfo: 'private access',
            building: 'Tall Tower',
            apartment: 'C',
            additionalAddressInfo: 'additional address info',
            state: 'a state',
        });
        Object.defineProperty(message, 'customer', {
            value: { ...message.customer, defaultBillingAddressId: 'billing-address-id' },
        }); //mock readonly property
        const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(message.customer.addresses.length).to.equal(2);
        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledWith(message.customer);
        expect(klaviyoEvent[0]).toMatchSnapshot();
    });

    it('should generate the klaviyo create profile event with the first billing address available when no default billing address is set', async () => {
        const message = getSampleCustomerCreatedMessage();
        message.customer.addresses.splice(0, message.customer.addresses.length);
        message.customer.addresses.push({
            id: 'delivery-address-id',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '+4407476588266',
            postalCode: 'SE1 5XG',
            streetName: 'some road',
            streetNumber: '23',
            additionalStreetInfo: 'private access',
            building: 'Tall Tower',
            apartment: 'C',
            additionalAddressInfo: 'additional address info',
            state: 'a state',
        });
        message.customer.addresses.push({
            id: 'first-billing-address-id',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '+4407476588266',
            postalCode: 'WS2 5FX',
            streetName: "I'm a billing address",
            streetNumber: '23',
            additionalStreetInfo: 'private access',
            building: 'Tall Tower',
            apartment: 'C',
            additionalAddressInfo: "I'm a billing address",
            state: 'a state',
        });
        message.customer.addresses.push({
            id: 'second-billing-address-id',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '+4407476588266',
            postalCode: 'WS2 5FY',
            streetName: "I'm another billing address",
            streetNumber: '23',
            additionalStreetInfo: 'private access',
            building: 'Tall Tower',
            apartment: 'C',
            additionalAddressInfo: "I'm another billing address",
            state: 'a state',
        });

        Object.defineProperty(message, 'customer', {
            value: {
                ...message.customer,
                billingAddressIds: ['second-billing-address-id', 'first-billing-address-id'],
                defaultBillingAddressId: null,
            },
        }); //mock readonly property

        const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(message.customer.addresses.length).to.equal(3);
        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledWith(message.customer);
        expect(klaviyoEvent[0]).toMatchSnapshot();
    });

    it('should generate the klaviyo create profile event with the first address when no billing address ids are set', async () => {
        const message = getSampleCustomerCreatedMessage();
        message.customer.addresses.splice(0, message.customer.addresses.length);
        message.customer.addresses.push({
            id: 'some-address-id',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '+4407476588266',
            postalCode: 'WS2 5FX',
            streetName: "I'm a random address",
            streetNumber: '23',
            additionalStreetInfo: 'private access',
            building: 'Tall Tower',
            apartment: 'C',
            additionalAddressInfo: "I'm a random address",
            state: 'a state',
        });
        message.customer.addresses.push({
            id: 'another-address-id',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '+4407476588266',
            postalCode: 'WS2 5FY',
            streetName: "I'm another random address",
            streetNumber: '23',
            additionalStreetInfo: 'private access',
            building: 'Tall Tower',
            apartment: 'C',
            additionalAddressInfo: "I'm another random address",
            state: 'a state',
        });

        Object.defineProperty(message, 'customer', {
            value: {
                ...message.customer,
                billingAddressIds: null,
                defaultBillingAddressId: null,
            },
        }); //mock readonly property

        const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(message.customer.addresses.length).to.equal(2);
        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledWith(message.customer);
        expect(klaviyoEvent[0]).toMatchSnapshot();
    });

    it('should generate the klaviyo create profile event without customer address inf when no address is available', async () => {
        const message = getSampleCustomerCreatedMessage();
        message.customer.addresses.splice(0, message.customer.addresses.length);
        Object.defineProperty(message, 'customer', {
            value: {
                ...message.customer,
                billingAddressIds: null,
                defaultBillingAddressId: null,
            },
        }); //mock readonly property

        const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(message.customer.addresses.length).to.equal(0);
        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.be.eq(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledTimes(1);
        expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toBeCalledWith(message.customer);
        expect(klaviyoEvent[0]).toMatchSnapshot();
    });

    describe('deduplication scenarios', () => {
        beforeEach(() => {
            contextMock.klaviyoService.getKlaviyoProfileByExternalId.mockResolvedValue(undefined);
        });

        it('should create new profile when deduplication is disabled', async () => {
            contextMock.profileDeduplicationService.shouldDeduplicate.mockReturnValue(false);
            const message = getSampleCustomerCreatedMessage();
            const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

            const klaviyoEvent = await event.generateKlaviyoEvents();

            expect(contextMock.profileDeduplicationService.findExistingProfileByEmail).not.toHaveBeenCalled();
            expect(klaviyoEvent[0].type).toBe('profileCreated');
        });

        it('should create new profile when deduplication is enabled but no existing profile found', async () => {
            contextMock.profileDeduplicationService.shouldDeduplicate.mockReturnValue(true);
            contextMock.profileDeduplicationService.findExistingProfileByEmail.mockResolvedValue({
                existingProfile: undefined,
                needsUpdate: false,
                klaviyoProfileId: undefined,
            });
            const message = getSampleCustomerCreatedMessage();
            const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

            const klaviyoEvent = await event.generateKlaviyoEvents();

            expect(contextMock.profileDeduplicationService.findExistingProfileByEmail).toHaveBeenCalledWith(
                message.customer.email,
                message.customer.id,
            );
            expect(klaviyoEvent[0].type).toBe('profileCreated');
        });

        it('should update existing profile when deduplication is enabled and profile found', async () => {
            const existingProfile: GetProfileResponseData = {
                id: 'existing-klaviyo-id',
                attributes: {
                    email: 'test@example.com',
                    externalId: 'old-external-id',
                },
            } as GetProfileResponseData;

            contextMock.profileDeduplicationService.shouldDeduplicate.mockReturnValue(true);
            contextMock.profileDeduplicationService.findExistingProfileByEmail.mockResolvedValue({
                existingProfile,
                needsUpdate: true,
                klaviyoProfileId: 'existing-klaviyo-id',
            });
            // Create a new message object with the desired email to avoid mutating a readonly property
            const origMessage = getSampleCustomerCreatedMessage();
            const message = {
                ...origMessage,
                customer: {
                    ...origMessage.customer,
                    email: 'test@example.com',
                },
            };
            const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

            const klaviyoEvent = await event.generateKlaviyoEvents();

            expect(contextMock.profileDeduplicationService.findExistingProfileByEmail).toHaveBeenCalledWith(
                'test@example.com',
                message.customer.id,
            );
            expect(klaviyoEvent[0].type).toBe('profileResourceUpdated');
            expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toHaveBeenCalledWith(
                message.customer,
                'existing-klaviyo-id',
            );
        });

        it('should update existing profile when deduplication is enabled and profile found with matching external_id', async () => {
            // Create a new message object with the desired email to avoid mutating a readonly property
            const origMessage = getSampleCustomerCreatedMessage();
            const message = {
                ...origMessage,
                customer: {
                    ...origMessage.customer,
                    email: 'test@example.com',
                },
            };
            const existingProfile: GetProfileResponseData = {
                id: 'existing-klaviyo-id',
                attributes: {
                    email: 'test@example.com',
                    externalId: message.customer.id,
                },
            } as GetProfileResponseData;

            contextMock.profileDeduplicationService.shouldDeduplicate.mockReturnValue(true);
            contextMock.profileDeduplicationService.findExistingProfileByEmail.mockResolvedValue({
                existingProfile,
                needsUpdate: false,
                klaviyoProfileId: 'existing-klaviyo-id',
            });
            const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

            const klaviyoEvent = await event.generateKlaviyoEvents();

            expect(klaviyoEvent[0].type).toBe('profileResourceUpdated');
            expect(contextMock.customerMapper.mapCtCustomerToKlaviyoProfile).toHaveBeenCalledWith(
                message.customer,
                'existing-klaviyo-id',
            );
        });

        it('should create new profile when customer has no email', async () => {
            contextMock.profileDeduplicationService.shouldDeduplicate.mockReturnValue(true);
            const origMessage = getSampleCustomerCreatedMessage();
            // Create a new customer object without the email property
            const { email, ...customerWithoutEmail } = origMessage.customer;
            const message = {
                ...origMessage,
                customer: customerWithoutEmail,
            };
            const event = CustomerCreatedEventProcessor.instance(message as unknown as MessageDeliveryPayload, contextMock);

            const klaviyoEvent = await event.generateKlaviyoEvents();

            expect(contextMock.profileDeduplicationService.findExistingProfileByEmail).not.toHaveBeenCalled();
            expect(klaviyoEvent[0].type).toBe('profileCreated');
        });
    });
});
