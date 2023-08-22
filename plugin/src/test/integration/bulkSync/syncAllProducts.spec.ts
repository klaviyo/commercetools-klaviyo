import { expect } from 'chai';
import {
    ctAuthNock,
    ctDeleteCustomObjectNock,
    ctGetCustomObjectNock,
    ctPostCustomObjectNock,
    getAllProducts,
} from '../nocks/commercetoolsNock';
import { ctGet1Product } from '../../testData/ctGetProducts';
import { ProductsSync } from '../../../domain/bulkSync/ProductsSync';
import { CTCustomObjectLockService } from '../../../domain/bulkSync/services/CTCustomObjectLockService';
import { getApiRoot } from '../../../infrastructure/driven/commercetools/ctService';
import { DefaultProductMapper } from '../../../domain/shared/mappers/DefaultProductMapper';
import { KlaviyoSdkService } from '../../../infrastructure/driven/klaviyo/KlaviyoSdkService';
import { DefaultCtProductService } from '../../../infrastructure/driven/commercetools/DefaultCtProductService';
import nock from 'nock';
import {
    klaviyoCreateItemJobNock,
    klaviyoGetItemJobNock,
    klaviyoCreateVariantJobNock,
    klaviyoGetVariantJobNock,
    klaviyoGetCatalogueItemsNock,
    klaviyoGetCatalogueVariantsNock,
} from '../nocks/KlaviyoCatalogueNock';
import { DummyCurrencyService } from '../../../domain/shared/services/dummyCurrencyService';

describe('syncAllProducts', () => {
    afterEach(() => {
        nock.cleanAll();
    });
    it('should sync all product events with klaviyo', async () => {
        ctAuthNock(4);
        const nockCtGetCustomObject = ctGetCustomObjectNock(404, 'productFullSync', {});
        const nockCtCreateCustomObject = ctPostCustomObjectNock('productFullSync');
        const nockCtDeleteCustomObject = ctDeleteCustomObjectNock('productFullSync');
        const nockCtGetAllProducts = getAllProducts(ctGet1Product);
        const nockKlaviyoEvent1 = klaviyoCreateItemJobNock(
            {
                attributes: {
                    items: [
                        {
                            attributes: {
                                catalog_type: '$default',
                                custom_metadata: {
                                    currency_json:
                                        '{"currency_AD":"EUR","currency_AT":"EUR","currency_AX":"EUR","currency_BE":"EUR","currency_BL":"EUR","currency_CP":"EUR","currency_CY":"EUR","currency_DE":"EUR","currency_EA":"EUR","currency_EE":"EUR","currency_ES":"EUR","currency_EU":"EUR","currency_FI":"EUR","currency_FR":"EUR","currency_FX":"EUR","currency_GF":"EUR","currency_GP":"EUR","currency_GR":"EUR","currency_IC":"EUR","currency_IE":"EUR","currency_IT":"EUR","currency_LT":"EUR","currency_LU":"EUR","currency_LV":"EUR","currency_MC":"EUR","currency_ME":"EUR","currency_MF":"EUR","currency_MQ":"EUR","currency_MT":"EUR","currency_NL":"EUR","currency_PM":"EUR","currency_PT":"EUR","currency_RE":"EUR","currency_SI":"EUR","currency_SK":"EUR","currency_SM":"EUR","currency_TF":"EUR","currency_VA":"EUR","currency_XK":"EUR","currency_YT":"EUR","currency_ZW":"EUR","currency_US":"USD"}',
                                    price_json:
                                        '{"price_EUR":118.75,"price_AD":118.75,"price_AT":118.75,"price_AX":118.75,"price_BE":118.75,"price_BL":118.75,"price_CP":118.75,"price_CY":118.75,"price_DE":118.75,"price_EA":118.75,"price_EE":118.75,"price_ES":118.75,"price_EU":118.75,"price_FI":118.75,"price_FR":118.75,"price_FX":118.75,"price_GF":118.75,"price_GP":118.75,"price_GR":118.75,"price_IC":118.75,"price_IE":118.75,"price_IT":118.75,"price_LT":118.75,"price_LU":118.75,"price_LV":118.75,"price_MC":118.75,"price_ME":118.75,"price_MF":118.75,"price_MQ":118.75,"price_MT":118.75,"price_NL":118.75,"price_PM":118.75,"price_PT":118.75,"price_RE":118.75,"price_SI":118.75,"price_SK":118.75,"price_SM":118.75,"price_TF":118.75,"price_VA":118.75,"price_XK":118.75,"price_YT":118.75,"price_ZW":118.75,"price_USD":118.75,"price_US":118.75}',
                                    slug_json:
                                        '{"slug_en":"gum-bag-medium-BS1900-black","slug_de":"gum-tasche-medium-BS1900-schwarz"}',
                                    title_json:
                                        '{"title_en":"Bag medium GUM black","title_de":"Tasche medium GUM schwarz"}',
                                },
                                description: '',
                                external_id: 'cb09966e-cb7a-4c3a-8eb5-e07f1a53ab8b',
                                image_full_url:
                                    'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082612_1_medium.jpg',
                                integration_type: '$custom',
                                price: 118.75,
                                published: true,
                                title: 'Bag medium GUM black',
                                url: 'https://example-store.com/products/gum-bag-medium-BS1900-black',
                            },
                            relationships: {
                                categories: {
                                    data: [
                                        {
                                            id: '$custom:::$default:::5b4de911-e0c3-473e-a6ba-dd61d47d0bbd',
                                            type: 'catalog-category',
                                        },
                                        {
                                            id: '$custom:::$default:::c7ee29ed-c092-4ed3-bda3-a66839ce90c7',
                                            type: 'catalog-category',
                                        },
                                        {
                                            id: '$custom:::$default:::12c2780d-5b45-4de7-8bbb-448df3e7a341',
                                            type: 'catalog-category',
                                        },
                                        {
                                            id: '$custom:::$default:::5b4de911-e0c3-473e-a6ba-dd61d47d0bce',
                                            type: 'catalog-category',
                                        },
                                    ],
                                },
                            },
                            type: 'catalog-item',
                        },
                    ],
                },
                type: 'catalog-item-bulk-create-job',
            },
            202,
            {
                data: {
                    type: 'catalog-item-bulk-create-job',
                    id: 'test-id',
                    attributes: {
                        job_id: 'string',
                        status: 'processing',
                        created_at: '2022-11-08T00:00:00',
                        total_count: 1,
                        completed_count: 1,
                        failed_count: 0,
                        completed_at: '2022-11-08T00:00:00',
                        expires_at: '2022-11-08T00:00:00',
                        errors: [],
                    },
                },
            },
        );

        const nockKlaviyoEvent2 = klaviyoGetItemJobNock('test-id', 200, {
            data: {
                type: 'catalog-item-bulk-create-job',
                id: 'test-id',
                attributes: {
                    job_id: 'string',
                    status: 'complete',
                    created_at: '2022-11-08T00:00:00',
                    total_count: 1,
                    completed_count: 1,
                    failed_count: 0,
                    completed_at: '2022-11-08T00:00:00',
                    expires_at: '2022-11-08T00:00:00',
                    errors: [],
                },
            },
        });

        const nockKlaviyoEvent3 = klaviyoCreateVariantJobNock(
            {
                attributes: {
                    variants: Array(2).fill({
                        attributes: {
                            catalog_type: '$default',
                            custom_metadata: {
                                currency_json:
                                    '{"currency_AD":"EUR","currency_AT":"EUR","currency_AX":"EUR","currency_BE":"EUR","currency_BL":"EUR","currency_CP":"EUR","currency_CY":"EUR","currency_DE":"EUR","currency_EA":"EUR","currency_EE":"EUR","currency_ES":"EUR","currency_EU":"EUR","currency_FI":"EUR","currency_FR":"EUR","currency_FX":"EUR","currency_GF":"EUR","currency_GP":"EUR","currency_GR":"EUR","currency_IC":"EUR","currency_IE":"EUR","currency_IT":"EUR","currency_LT":"EUR","currency_LU":"EUR","currency_LV":"EUR","currency_MC":"EUR","currency_ME":"EUR","currency_MF":"EUR","currency_MQ":"EUR","currency_MT":"EUR","currency_NL":"EUR","currency_PM":"EUR","currency_PT":"EUR","currency_RE":"EUR","currency_SI":"EUR","currency_SK":"EUR","currency_SM":"EUR","currency_TF":"EUR","currency_VA":"EUR","currency_XK":"EUR","currency_YT":"EUR","currency_ZW":"EUR","currency_US":"USD"}',
                                price_json:
                                    '{"price_EUR":118.75,"price_AD":118.75,"price_AT":118.75,"price_AX":118.75,"price_BE":118.75,"price_BL":118.75,"price_CP":118.75,"price_CY":118.75,"price_DE":118.75,"price_EA":118.75,"price_EE":118.75,"price_ES":118.75,"price_EU":118.75,"price_FI":118.75,"price_FR":118.75,"price_FX":118.75,"price_GF":118.75,"price_GP":118.75,"price_GR":118.75,"price_IC":118.75,"price_IE":118.75,"price_IT":118.75,"price_LT":118.75,"price_LU":118.75,"price_LV":118.75,"price_MC":118.75,"price_ME":118.75,"price_MF":118.75,"price_MQ":118.75,"price_MT":118.75,"price_NL":118.75,"price_PM":118.75,"price_PT":118.75,"price_RE":118.75,"price_SI":118.75,"price_SK":118.75,"price_SM":118.75,"price_TF":118.75,"price_VA":118.75,"price_XK":118.75,"price_YT":118.75,"price_ZW":118.75,"price_USD":118.75,"price_US":118.75}',
                                slug_json:
                                    '{"slug_en":"gum-bag-medium-BS1900-black","slug_de":"gum-tasche-medium-BS1900-schwarz"}',
                                title_json:
                                    '{"title_en":"Bag medium GUM black","title_de":"Tasche medium GUM schwarz"}',
                            },
                            description: '',
                            external_id: 'A0E2000000027DV',
                            image_full_url:
                                'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082612_1_medium.jpg',
                            integration_type: '$custom',
                            inventory_policy: 1,
                            inventory_quantity: 0,
                            price: 118.75,
                            published: true,
                            sku: 'A0E2000000027DV',
                            title: 'Bag medium GUM black',
                            url: 'https://example-store.com/products/gum-bag-medium-BS1900-black',
                        },
                        relationships: {
                            items: {
                                data: [
                                    {
                                        id: '$custom:::$default:::cb09966e-cb7a-4c3a-8eb5-e07f1a53ab8b',
                                        type: 'catalog-item',
                                    },
                                ],
                            },
                        },
                        type: 'catalog-variant',
                    }),
                },
                type: 'catalog-variant-bulk-create-job',
            },
            202,
            {
                data: {
                    type: 'catalog-variant-bulk-create-job',
                    id: 'test-id',
                    attributes: {
                        job_id: 'string',
                        status: 'processing',
                        created_at: '2022-11-08T00:00:00',
                        total_count: 1,
                        completed_count: 1,
                        failed_count: 0,
                        completed_at: '2022-11-08T00:00:00',
                        expires_at: '2022-11-08T00:00:00',
                        errors: [],
                    },
                },
            },
        );

        const nockKlaviyoEvent4 = klaviyoGetVariantJobNock('test-id', 200, {
            data: {
                type: 'catalog-variant-bulk-create-job',
                id: 'test-id',
                attributes: {
                    job_id: 'string',
                    status: 'complete',
                    created_at: '2022-11-08T00:00:00',
                    total_count: 1,
                    completed_count: 1,
                    failed_count: 0,
                    completed_at: '2022-11-08T00:00:00',
                    expires_at: '2022-11-08T00:00:00',
                    errors: [],
                },
            },
        });

        const nockKlaviyoEvent5 = klaviyoGetCatalogueItemsNock(200, {
            data: [],
        });

        const nockKlaviyoEvent6 = klaviyoGetCatalogueVariantsNock(200, {
            data: [],
        });

        const productsSync = new ProductsSync(
            new CTCustomObjectLockService(getApiRoot()),
            new DefaultProductMapper(new DummyCurrencyService()),
            new KlaviyoSdkService(),
            new DefaultCtProductService(getApiRoot()),
        );
        await productsSync.syncAllProducts();

        expect(nockCtGetCustomObject.isDone()).to.be.true;
        expect(nockCtCreateCustomObject.isDone()).to.be.true;
        expect(nockCtDeleteCustomObject.isDone()).to.be.true;
        expect(nockCtGetAllProducts.isDone()).to.be.true;
        expect(nockKlaviyoEvent1.isDone()).to.be.true;
        expect(nockKlaviyoEvent2.isDone()).to.be.true;
        expect(nockKlaviyoEvent3.isDone()).to.be.true;
        expect(nockKlaviyoEvent4.isDone()).to.be.true;
        expect(nockKlaviyoEvent5.isDone()).to.be.true;
        expect(nockKlaviyoEvent6.isDone()).to.be.true;
        expect(nock.activeMocks().length).to.eq(0);
    });
});
