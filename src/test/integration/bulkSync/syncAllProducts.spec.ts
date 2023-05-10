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
                                description: 'None',
                                external_id: 'cb09966e-cb7a-4c3a-8eb5-e07f1a53ab8b',
                                image_full_url:
                                    'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082612_1_medium.jpg',
                                integration_type: '$custom',
                                published: true,
                                title: 'Bag medium GUM black',
                                url: 'https://example-store.com/products/gum-bag-medium-BS1900-black',
                                price: 118.75,
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
                            description: 'None',
                            external_id: 'A0E2000000027DV',
                            image_full_url:
                                'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/082612_1_medium.jpg',
                            integration_type: '$custom',
                            inventory_quantity: 0,
                            inventory_policy: 1,
                            price: 118.75,
                            published: true,
                            sku: 'A0E2000000027DV',
                            title: 'Bag medium GUM black | Variant: A0E2000000027DV',
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
