import { expect as exp } from 'chai';
import { mockDeep } from 'jest-mock-extended';
import { OrderCreatedEvent } from './orderCreatedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';

describe('orderCreatedEvent > isEventValid', () => {
    it('should return valid when is an Imported message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderImported' });
        Object.defineProperty(ctMessageMock, 'order', { value: { customerId: '123-1230-123', orderState: 'Open' } });

        const event = OrderCreatedEvent.instance(ctMessageMock);

        exp(event.isEventValid()).to.be.true;
    });

    it('should return valid when is an OrderImported message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'order', { value: { customerId: '123-1230-123', orderState: 'Open' } }); //mock readonly property

        const event = OrderCreatedEvent.instance(ctMessageMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource     | type              | order
        ${'invalid'} | ${'OrderCreated'} | ${{ customerId: '123-1230-123' }}
        ${'order'}   | ${'invalid'}      | ${{}}
        ${'order'}   | ${'OrderCreated'} | ${null}
    `(
        'should return invalid when is not an orderCreated message, resource: $resource type: $type',
        ({ resource, type, order }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'type', { value: type }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'order', { value: order }); //mock readonly property

            const event = OrderCreatedEvent.instance(ctMessageMock);

            exp(event.isEventValid()).to.be.false;
        },
    );

    it('should return invalid when the orderState is invalid', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'order', {
            value: { customerId: '123-1230-123', orderState: 'FakeState' },
        }); //mock readonly property

        const event = OrderCreatedEvent.instance(ctMessageMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('orderCreatedEvent > generateKlaviyoEvent', () => {
    it('should generate the klaviyo event for an order created message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'order', {
            value: {
                customerId: '123-123-123',
                customerEmail: 'test@klaviyo.com',
                orderState: 'Open',
                totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
                createdAt: '2023-01-27T15:00:00.000Z',
            },
        }); //mock readonly property

        const event = OrderCreatedEvent.instance(ctMessageMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(1);
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });

    it('should generate the klaviyo events for line items in an order created message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'order', {
            value: {
                customerId: '123-123-123',
                customerEmail: 'test@klaviyo.com',
                orderState: 'Open',
                createdAt: '2023-01-27T15:00:00.000Z',
                totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
                lineItems: [
                    {
                        id: '123-123-123',
                        totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
                        name: {
                            en: 'Test product',
                        },
                    },
                ],
            },
        }); //mock readonly property

        const event = OrderCreatedEvent.instance(ctMessageMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(2);
        klaviyoEvent.forEach((event) => {
            expect(event.body).toMatchSnapshot();
        });
    });
});
