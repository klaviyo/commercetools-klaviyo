import { expect as exp } from 'chai';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { OrderCreatedEvent } from './orderCreatedEvent';
import { MessageDeliveryPayload } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/subscription';
import { ctAuthNock, ctGetOrderByIdNock } from '../../../test/integration/nocks/commercetoolsNock';
import config from 'config';

const contextMock: DeepMockProxy<Context> = mockDeep<Context>();
contextMock.currencyService.convert.mockImplementation((value, currency) => value);

describe('orderCreatedEvent > isEventValid', () => {
    it('should return valid when is an Imported message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderImported' });
        Object.defineProperty(ctMessageMock, 'order', { value: { customerId: '123-1230-123', orderState: 'Open' } });

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it('should return valid when is an OrderImported message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCreated' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'order', { value: { customerId: '123-1230-123', orderState: 'Open' } }); //mock readonly property

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.true;
    });

    it.each`
        resource     | type                  | order                             | customer
        ${'invalid'} | ${'OrderCreated'}     | ${{ customerId: '123-1230-123' }} | ${null}
        ${'order'}   | ${'invalid'}          | ${{}}                             | ${null}
        ${'order'}   | ${'OrderCreated'}     | ${null}                           | ${null}
        ${'order'}   | ${'OrderCustomerSet'} | ${null}                           | ${null}
    `(
        'should return invalid when is not an orderCreated message, resource: $resource type: $type',
        ({ resource, type, order, customer }) => {
            const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
            Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: resource } }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'type', { value: type }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'order', { value: order }); //mock readonly property
            Object.defineProperty(ctMessageMock, 'customer', { value: customer }); //mock readonly property

            const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

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
        Object.defineProperty(ctMessageMock, 'customer', { value: null }); //mock readonly property

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        exp(event.isEventValid()).to.be.false;
    });
});

describe('orderCreatedEvent > generateKlaviyoEvent', () => {
    it('should generate the klaviyo event for an OrderCreated message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
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

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(1);
        expect(contextMock.currencyService.convert).toBeCalledTimes(1);
        expect(contextMock.currencyService.convert).toBeCalledWith(13, 'USD');
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });

    it('should generate the klaviyo events for line items in an OrderCreated message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order' } }); //mock readonly property
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

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(2);
        expect(contextMock.currencyService.convert).toBeCalledTimes(1);
        expect(contextMock.currencyService.convert).toBeCalledWith(13, 'USD');
        klaviyoEvent.forEach((event) => {
            expect(event.body).toMatchSnapshot();
        });
    });

    it('should generate the klaviyo event for an OrderCustomerSet message', async () => {
        const ctMessageMock: MessageDeliveryPayload = mockDeep<MessageDeliveryPayload>();
        Object.defineProperty(ctMessageMock, 'resource', { value: { typeId: 'order', id: '123123123' } }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'type', { value: 'OrderCustomerSet' }); //mock readonly property
        Object.defineProperty(ctMessageMock, 'customer', {
            value: {
                typeId: 'customer',
                id: '123123123',
            },
        }); //mock readonly property

        ctAuthNock();
        ctGetOrderByIdNock('123123123');

        const event = OrderCreatedEvent.instance(ctMessageMock, contextMock);

        const klaviyoEvent = await event.generateKlaviyoEvents();

        exp(klaviyoEvent).to.not.be.undefined;
        exp(klaviyoEvent.length).to.eq(1);
        expect(contextMock.currencyService.convert).toBeCalledTimes(1);
        expect(contextMock.currencyService.convert).toBeCalledWith(13, 'USD');
        expect(klaviyoEvent[0].body).toMatchSnapshot();
    });
});
