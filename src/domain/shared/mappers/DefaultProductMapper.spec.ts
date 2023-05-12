import { DefaultProductMapper } from './DefaultProductMapper';
import { ctGet1Product } from '../../../test/testData/ctGetProducts';
import { DummyCurrencyService } from '../services/dummyCurrencyService';
import { mock } from 'jest-mock-extended';
import { Product, ProductVariant } from '@commercetools/platform-sdk';

const mockCurrencyService = mock<DummyCurrencyService>();
mockCurrencyService.convert.mockImplementation((value, currency) => value);
const productMapper = new DefaultProductMapper(mockCurrencyService);

describe('map CT product to Klaviyo product', () => {
    it('should map a commercetools product to a klaviyo item', () => {
        const klaviyoEvent = productMapper.mapCtProductToKlaviyoItem(ctGet1Product.results[0] as unknown as Product);
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map commercetools product variants to a klaviyo variants', () => {
        const klaviyoEvent = productMapper.mapCtProductVariantToKlaviyoVariant(
            ctGet1Product.results[0] as unknown as Product,
            ctGet1Product.results[0].masterData.current.masterVariant as unknown as ProductVariant,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map commercetools product variants to a klaviyo variants', () => {
        const klaviyoEvent = productMapper.mapCtProductVariantToKlaviyoVariant(
            ctGet1Product.results[0] as unknown as Product,
            ctGet1Product.results[0].masterData.current.masterVariant as unknown as ProductVariant,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map commercetools inventory entry to a klaviyo variant updated request', () => {
        const klaviyoEvent = productMapper.mapCtInventoryEntryToKlaviyoVariant(
            {
                id: 'df743513-c74e-453e-8c4c-e414d77b8d85',
                version: 1,
                createdAt: '2023-05-09T15:00:47.410Z',
                lastModifiedAt: '2023-05-09T15:00:47.410Z',
                lastModifiedBy: {},
                createdBy: {},
                sku: 'EXPROD1',
                quantityOnStock: 55,
                availableQuantity: 55,
            },
            {
                id: '$custom:::$default:::EXPROD1',
            } as any,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map commercetools inventory entry with supply channel to a klaviyo variant updated request', () => {
        const klaviyoEvent = productMapper.mapCtInventoryEntryToKlaviyoVariant(
            {
                id: 'df743513-c74e-453e-8c4c-e414d77b8d85',
                version: 1,
                createdAt: '2023-05-09T15:00:47.410Z',
                lastModifiedAt: '2023-05-09T15:00:47.410Z',
                lastModifiedBy: {},
                createdBy: {},
                sku: 'EXPROD1',
                supplyChannel: {
                    typeId: 'channel',
                    id: '03c22295-79b0-4838-bc4c-9724133a27ce',
                },
                quantityOnStock: 120,
                availableQuantity: 120,
            },
            {
                id: '$custom:::$default:::EXPROD1',
            } as any,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map commercetools inventory entry for variant with invalid supply channel and set undefined inventory_quantity', () => {
        const klaviyoEvent = productMapper.mapCtInventoryEntryToKlaviyoVariant(
            {
                id: 'df743513-c74e-453e-8c4c-e414d77b8d85',
                version: 1,
                createdAt: '2023-05-09T15:00:47.410Z',
                lastModifiedAt: '2023-05-09T15:00:47.410Z',
                lastModifiedBy: {},
                createdBy: {},
                sku: 'EXPROD1',
                supplyChannel: {
                    typeId: 'channel',
                    id: 'this-channel-is-not-configured',
                },
                quantityOnStock: 55,
                availableQuantity: 55,
            },
            {
                id: '$custom:::$default:::EXPROD1',
            } as any,
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map commercetools product variants prices by priority', () => {
        const realDate = global.Date;
        const mockDate = new Date('2023-05-08T17:00:00.000Z');

        const dateSpy = jest.spyOn(global, 'Date').mockImplementation((...args) => {
            if (args.length) {
                return new realDate(...args);
            }
            return mockDate;
        });

        const klaviyoEvent = productMapper.mapCtProductVariantToKlaviyoVariant(
            ctGet1Product.results[0] as unknown as Product,
            {
                ...ctGet1Product.results[0].masterData.current.masterVariant,
                prices: [
                    {
                        id: '58cf4f29-f55b-40a2-9360-97a15ee0a609',
                        value: {
                            type: 'centPrecision',
                            currencyCode: 'EUR',
                            centAmount: 500,
                            fractionDigits: 2,
                        },
                    },
                    {
                        id: '6c61ed1b-f2d7-47a6-b536-2cb8f7156019',
                        value: {
                            type: 'centPrecision',
                            currencyCode: 'EUR',
                            centAmount: 2000,
                            fractionDigits: 2,
                        },
                        validUntil: '2023-05-11T04:00:00.000Z',
                    },
                    {
                        id: 'fe328c80-9524-4232-a0d6-ab166df13b27',
                        value: {
                            type: 'centPrecision',
                            currencyCode: 'EUR',
                            centAmount: 500,
                            fractionDigits: 2,
                        },
                        validFrom: '2023-05-11T04:00:00.000Z',
                    },
                    {
                        id: '35bca0a3-d0f8-4431-8b2f-d4bb2635de73',
                        value: {
                            type: 'centPrecision',
                            currencyCode: 'EUR',
                            centAmount: 12200,
                            fractionDigits: 2,
                        },
                        channel: {
                            typeId: 'channel',
                            id: '03c22295-79b0-4838-bc4c-9724133a27ce',
                        },
                    },
                ],
            } as unknown as ProductVariant,
        );

        dateSpy.mockRestore();
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map variant inventory by channel to klaviyo variant inventory quantity', () => {
        const klaviyoEvent = productMapper.mapCtProductVariantToKlaviyoVariant(
            ctGet1Product.results[0] as unknown as Product,
            {
                ...ctGet1Product.results[0].masterData.current.masterVariant,
                availability: {
                    isOnStock: true,
                    availableQuantity: 100,
                    version: 1,
                    id: 'f8690556-9cc1-481d-8017-0f28ba46aa6f',
                    channels: {
                        '03c22295-79b0-4838-bc4c-9724133a27ce': {
                            isOnStock: true,
                            availableQuantity: 55,
                            version: 1,
                            id: 'df743513-c74e-453e-8c4c-e414d77b8d85',
                        },
                    },
                },
            } as unknown as ProductVariant,
        );

        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools product array to a klaviyo create items job request', () => {
        const klaviyoEvent = productMapper.mapCtProductsToKlaviyoItemJob(
            ctGet1Product.results as unknown as Product[],
            'itemCreated',
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools product array to a klaviyo update items job request', () => {
        const klaviyoEvent = productMapper.mapCtProductsToKlaviyoItemJob(
            ctGet1Product.results as unknown as Product[],
            'itemUpdated',
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools product with variants to a klaviyo create variants job request', () => {
        const klaviyoEvent = productMapper.mapCtProductVariantsToKlaviyoVariantsJob(
            ctGet1Product.results[0] as unknown as Product,
            [ctGet1Product.results[0].masterData.current.masterVariant as unknown as ProductVariant],
            'variantCreated',
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools product with variants to a klaviyo update variants job request', () => {
        const klaviyoEvent = productMapper.mapCtProductVariantsToKlaviyoVariantsJob(
            ctGet1Product.results[0] as unknown as Product,
            [ctGet1Product.results[0].masterData.current.masterVariant as unknown as ProductVariant],
            'variantUpdated',
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools product with variants to a klaviyo delete variants job request', () => {
        const klaviyoEvent = productMapper.mapCtProductVariantsToKlaviyoVariantsJob(
            ctGet1Product.results[0] as unknown as Product,
            [`$custom:::$default:::${ctGet1Product.results[0].masterData.current.masterVariant.sku}`],
            'variantDeleted',
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });
});
