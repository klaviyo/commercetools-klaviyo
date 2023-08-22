import { DefaultOrderMapper } from './DefaultOrderMapper';
import { mock } from 'jest-mock-extended';
import { DummyCurrencyService } from '../services/dummyCurrencyService';
import { sampleOrderCreatedMessage } from '../../../test/testData/orderData';
import { DefaultCustomerMapper } from './DefaultCustomerMapper';

const mockCurrencyService = mock<DummyCurrencyService>();
mockCurrencyService.convert.mockImplementation((value, currency) => value);
const mockCustomerMapper = mock<DefaultCustomerMapper>();
const orderMapper = new DefaultOrderMapper(mockCurrencyService, mockCustomerMapper);
describe('map CT order to Klaviyo event', () => {
    it('should map a commercetools order with a given metric to a klaviyo event', () => {
        const klaviyoEvent = orderMapper.mapCtOrderToKlaviyoEvent(
            sampleOrderCreatedMessage.order,
            [],
            'someMetric',
            false,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map order line items and custom line items to ItemNames property in the klaviyo event', () => {
        const klaviyoEvent = orderMapper.mapCtOrderToKlaviyoEvent(
            {
                ...sampleOrderCreatedMessage.order,
                lineItems: [
                    {
                        name: {
                            'en-US': 'Product Line Item 1',
                        },
                    },
                ] as any,
                customLineItems: [
                    {
                        name: {
                            'en-US': 'Custom Line Item 1',
                        },
                    },
                ] as any,
            },
            [],
            'someMetric',
            false,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map product categories to the Categories property in the klaviyo event', () => {
        const klaviyoEvent = orderMapper.mapCtOrderToKlaviyoEvent(
            {
                ...sampleOrderCreatedMessage.order,
                lineItems: [
                    {
                        name: {
                            'en-US': 'Product Line Item 1',
                        },
                    },
                ] as any,
                customLineItems: [
                    {
                        name: {
                            'en-US': 'Custom Line Item 1',
                        },
                    },
                ] as any,
            },
            [
                {
                    masterData: {
                        current: {
                            categories: {
                                obj: {
                                    name: {
                                        'en-US': 'Test Category 1',
                                    },
                                    ancestors: [],
                                },
                            },
                        },
                    },
                } as any,
            ],
            'someMetric',
            false,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should include/exclude/map custom fields in a commercetools order and send them with the klaviyo event', () => {
        const klaviyoEvent = orderMapper.mapCtOrderToKlaviyoEvent(
            {
                ...sampleOrderCreatedMessage.order,
                custom: {
                    type: {
                        typeId: 'type',
                        id: '123456',
                    },
                    fields: {
                        includedField: true,
                        ignoredField: 'test-ignored-field',
                    },
                },
            },
            [],
            'someMetric',
            false,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a billing address profile property for a realtime klaviyo event', () => {
        mockCustomerMapper.mapCTAddressToKlaviyoLocation.mockImplementation((address) => {
            const address1 = [address?.apartment, address?.building, address?.streetNumber, address?.streetName]
                  .filter((element) => element)
                  .join(', ');
            return {
                address1,
                city: address?.city,
                country: address?.country,
                region: address?.region,
                zip: address?.postalCode,
            }
        });
        const klaviyoEvent = orderMapper.mapCtOrderToKlaviyoEvent(
            {
                ...sampleOrderCreatedMessage.order,
                billingAddress: {
                    streetName: 'Tribunali',
                    streetNumber: '14',
                    postalCode: '80100',
                    city: 'Napoli',
                    country: 'IT',
                },
            },
            [],
            'someMetric',
            true,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });
});

describe('map CT refunded order to Klaviyo event', () => {
    it('should map a commercetools refunded order with a given metric to a klaviyo event', () => {
        const klaviyoEvent = orderMapper.mapCtRefundedOrderToKlaviyoEvent(
            {
                ...sampleOrderCreatedMessage.order,
                paymentInfo: {
                    payments: [
                        {
                            typeId: 'payment',
                            id: '123456',
                            obj: {
                                transactions: [
                                    {
                                        id: '123456',
                                        amount: {
                                            type: 'centPrecision',
                                            currencyCode: 'EUR',
                                            centAmount: 1300,
                                            fractionDigits: 2,
                                        },
                                        type: 'Refund',
                                        state: 'Success',
                                    },
                                ],
                            },
                        },
                    ],
                },
            } as any,
            [],
            'someMetric',
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should include/exclude/map custom fields in a commercetools order and send them with the klaviyo event', () => {
        const klaviyoEvent = orderMapper.mapCtRefundedOrderToKlaviyoEvent(
            {
                ...sampleOrderCreatedMessage.order,
                custom: {
                    type: {
                        typeId: 'type',
                        id: '123456',
                    },
                    fields: {
                        includedField: true,
                        ignoredField: 'test-ignored-field',
                    },
                },
                paymentInfo: {
                    payments: [
                        {
                            typeId: 'payment',
                            id: '123456',
                            obj: {
                                transactions: [
                                    {
                                        id: '123456',
                                        amount: {
                                            type: 'centPrecision',
                                            currencyCode: 'EUR',
                                            centAmount: 1300,
                                            fractionDigits: 2,
                                        },
                                        type: 'Refund',
                                        state: 'Success',
                                    },
                                ],
                            },
                        },
                    ],
                },
            } as any,
            [],
            'someMetric',
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });
});

describe('map CT order line to klaviyo event', () => {
    it('should map a commercetools order line to a klaviyo Order Product event', () => {
        const klaviyoEvent = orderMapper.mapOrderLineToProductOrderedEvent(
            {
                discountedPricePerQuantity: [],
                lineItemMode: '',
                perMethodTaxRate: [],
                price: {
                    id: 'someId',
                    value: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
                },
                priceMode: '',
                productId: '',
                productType: { id: 'id', typeId: 'product-type' },
                quantity: 0,
                state: [],
                taxedPricePortions: [],
                variant: { id: 1 },
                id: '123-123-123',
                totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
                name: {
                    en: 'Test product',
                },
            },
            sampleOrderCreatedMessage.order,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });
});
