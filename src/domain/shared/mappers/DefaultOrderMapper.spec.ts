import { DefaultOrderMapper } from './DefaultOrderMapper';
import { mock } from 'jest-mock-extended';
import { DummyCurrencyService } from '../services/dummyCurrencyService';
import { sampleOrderCreatedMessage } from '../../../test/testData/orderData';

const mockCurrencyService = mock<DummyCurrencyService>();
mockCurrencyService.convert.mockImplementation((value, currency) => value);
const orderMapper = new DefaultOrderMapper(mockCurrencyService);
describe('map CT order to Klaviyo event', () => {
    it('should map a commercetools order with a given metric to a klaviyo event', () => {
        const klaviyoEvent = orderMapper.mapCtOrderToKlaviyoEvent(sampleOrderCreatedMessage.order, 'someMetric');
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
            'someMetric',
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
