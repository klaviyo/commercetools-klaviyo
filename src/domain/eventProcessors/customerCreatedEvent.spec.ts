import { CustomerCreatedEvent } from './customerCreatedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { mockDeep } from 'jest-mock-extended';
import { expect as exp } from 'chai';
import { sampleCustomerCreatedEvent } from '../../test/testData/customerData';

describe('customerCreatedEvent > isEventValid', () => {
    it('should return valid when the customer created resource has all the required fields', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'customer' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'CustomerCreated' });
        Object.defineProperty(ctMessageMock, 'customer', { value: { email: 'some@email.com' } });

        const event = CustomerCreatedEvent.instance(ctMessageMock);

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

        const event = CustomerCreatedEvent.instance(ctMessageMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('customerCreatedEvent > generateKlaviyoEvent', () => {
    it('should generate the klaviyo event when the input customer created event is valid', () => {
        const message = sampleCustomerCreatedEvent as unknown as MessageDeliveryPayload;
        const event = CustomerCreatedEvent.instance(message);

        const klaviyoEvent = event.generateKlaviyoEvent();
        exp(klaviyoEvent).to.not.be.undefined;
        expect(klaviyoEvent.body).toMatchSnapshot();
    });
});
