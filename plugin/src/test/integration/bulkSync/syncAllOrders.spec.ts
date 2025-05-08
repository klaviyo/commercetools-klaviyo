import { expect } from 'chai';
import {
    ctAuthNock,
    ctDeleteCustomObjectNock,
    ctGetCustomObjectNock,
    ctPostCustomObjectNock,
    getAllOrders,
    getProductsByIdRange,
} from '../nocks/commercetoolsNock';
import { klaviyoEventNock } from '../nocks/KlaviyoEventNock';
import { ctGet2Orders } from '../../testData/ctGetOrders';
import { OrdersSync } from '../../../domain/bulkSync/OrdersSync';
import { CTCustomObjectLockService } from '../../../domain/bulkSync/services/CTCustomObjectLockService';
import { getApiRoot } from '../../../infrastructure/driven/commercetools/ctService';
import { DefaultOrderMapper } from '../../../domain/shared/mappers/DefaultOrderMapper';
import { DummyCurrencyService } from '../../../domain/shared/services/dummyCurrencyService';
import { KlaviyoSdkService } from '../../../infrastructure/driven/klaviyo/KlaviyoSdkService';
import { DefaultCtOrderService } from '../../../infrastructure/driven/commercetools/DefaultCtOrderService';
import nock from 'nock';
import { DefaultCtProductService } from '../../../infrastructure/driven/commercetools/DefaultCtProductService';
import { DefaultCustomerMapper } from '../../../domain/shared/mappers/DefaultCustomerMapper';

describe('syncAllOrders', () => {
    afterEach(() => {
        nock.cleanAll();
    });
    it('should sync all order events with klaviyo', async () => {
        ctAuthNock(6);
        const nockCtGetCustomObject = ctGetCustomObjectNock(404, 'orderFullSync', {});
        ctGetCustomObjectNock(404, 'orderFullSync', {});
        const nockCtCreateCustomObject = ctPostCustomObjectNock('orderFullSync');
        const nockCtDeleteCustomObject = ctDeleteCustomObjectNock('orderFullSync');
        const nockCtGetAllOrders = getAllOrders({
            count: 0,
            results: [
                {
                    ...ctGet2Orders.results[0]
                },
            ],
        });
        const nockCtGetProductsByIdRange1 = getProductsByIdRange(
            ['2d69d31e-cccc-450d-83c8-aa27c2a0a620', '346a4513-82ee-4aea-90e0-2e7ded859e77'],
            {
                results: [
                    {
                        masterData: {
                            current: {
                                categories: {
                                    obj: {
                                        name: {
                                            'en-US': 'Test Category 1',
                                        },
                                        ancestors: [],
                                    }
                                },
                            },
                        },
                    },
                ],
                count: 0,
            },
        );
        const nockKlaviyoEvent1 = klaviyoEventNock({
            attributes: {
                metric: { name: 'Placed Order' },
                profile: { email: 'testuser1@klaviyo.com' },
                properties: {
                    createdAt: '2023-02-09T10:02:50.207Z',
                    customItems: [],
                    customerEmail: 'testuser1@klaviyo.com',
                    items: [
                        {
                            addedAt: '2023-02-09T10:02:50.192Z',
                            discountedPricePerQuantity: [],
                            id: 'dd853ebf-b35d-454e-9c6c-703479df6cbd',
                            lastModifiedAt: '2023-02-09T10:02:50.192Z',
                            lineItemMode: 'Standard',
                            name: { en: 'Product Name' },
                            perMethodTaxRate: [],
                            price: {
                                id: '0853898a-2f36-44f5-8f1b-c20775ab6467',
                                value: {
                                    centAmount: 40625,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            priceMode: 'Platform',
                            productId: '2d69d31e-cccc-450d-83c8-aa27c2a0a620',
                            productKey: '72997',
                            productType: {
                                id: 'a6408130-1800-4cb3-9332-14d27879d929',
                                typeId: 'product-type',
                                version: 1,
                            },
                            quantity: 1,
                            state: [
                                { quantity: 1, state: { id: '3d45b624-3e5b-410c-a9b1-22a7987a7cdf', typeId: 'state' } },
                            ],
                            taxedPricePortions: [],
                            totalPrice: {
                                centAmount: 40625,
                                currencyCode: 'EUR',
                                fractionDigits: 2,
                                type: 'centPrecision',
                            },
                            variant: {
                                assets: [],
                                attributes: [
                                    { name: 'articleNumberManufacturer', value: '30S4GTVS6L 230 LUG' },
                                    { name: 'articleNumberMax', value: '72997' },
                                    { name: 'matrixId', value: 'A0E200000001YNN' },
                                    { name: 'baseId', value: '72997' },
                                    { name: 'designer', value: { key: 'michaelkors', label: 'Michael Kors' } },
                                    { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
                                    { name: 'commonSize', value: { key: 'oneSize', label: 'one Size' } },
                                    { name: 'size', value: 'one size' },
                                    {
                                        name: 'color',
                                        value: { key: 'brown', label: { de: 'braun', en: 'brown', it: 'marrone' } },
                                    },
                                    { name: 'colorFreeDefinition', value: { de: 'luggage', en: 'luggage' } },
                                    { name: 'style', value: { key: 'sporty', label: 'sporty' } },
                                    { name: 'gender', value: { key: 'women', label: 'Damen' } },
                                    { name: 'season', value: 's15' },
                                ],
                                id: 1,
                                images: [
                                    {
                                        dimensions: { h: 0, w: 0 },
                                        url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/072997_1_large.jpg',
                                    },
                                ],
                                key: 'A0E200000001YNN',
                                prices: [
                                    {
                                        id: '66e65866-50cb-487d-b092-7de6e8e4f9a9',
                                        value: {
                                            centAmount: 40625,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        customerGroup: {
                                            id: '3dc582f5-e5a5-493a-ae4d-726356542a7b',
                                            typeId: 'customer-group',
                                        },
                                        id: '6f603a55-39b5-4109-a52b-a798faa930ed',
                                        value: {
                                            centAmount: 26639,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        country: 'US',
                                        id: '732c27eb-34b8-4160-a352-fff57c340be3',
                                        value: {
                                            centAmount: 40625,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        customerGroup: {
                                            id: '3dc582f5-e5a5-493a-ae4d-726356542a7b',
                                            typeId: 'customer-group',
                                        },
                                        id: 'fc957081-d800-42a5-9e4c-b2cf0f968d32',
                                        value: {
                                            centAmount: 26639,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        country: 'DE',
                                        id: '349ada18-6889-49a8-8dec-191589b509e6',
                                        value: {
                                            centAmount: 32500,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        country: 'IT',
                                        id: 'f33f6bd7-5156-42f8-9bfa-99536b6a3319',
                                        value: {
                                            centAmount: 32500,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        country: 'GB',
                                        id: '84ea9651-a3f9-412e-afbb-e57c639f1986',
                                        value: {
                                            centAmount: 32500,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'd79fcace-9711-4665-833d-c80be68dbb01', typeId: 'channel' },
                                        country: 'DE',
                                        id: '79a09808-5904-4a50-96a9-1e3b570e4e47',
                                        value: {
                                            centAmount: 31850,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'f9a9e6ab-7f3b-469b-abf4-d3422d54bdeb', typeId: 'channel' },
                                        id: '19bb9e86-06e1-441b-86de-3a3b10e59a62',
                                        value: {
                                            centAmount: 39000,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: '4acdd01d-db26-4f6f-92c0-cc42b7ed403f', typeId: 'channel' },
                                        country: 'DE',
                                        id: 'd4ed1a7a-f886-4aeb-8bfd-910e83112701',
                                        value: {
                                            centAmount: 35100,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: '75ab4f19-9eb9-4c8d-8ace-ad7a822958ed', typeId: 'channel' },
                                        country: 'DE',
                                        id: '25bb5671-a606-4b31-a4d9-ec166f33e006',
                                        value: {
                                            centAmount: 34775,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'd6085a8c-d42b-4e24-a51f-370edebfbbdf', typeId: 'channel' },
                                        country: 'DE',
                                        id: '98982a79-1251-4701-8b5a-ef5f710a2a60',
                                        value: {
                                            centAmount: 34125,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'c04d75ca-f367-4bef-baa5-5790dd931707', typeId: 'channel' },
                                        country: 'US',
                                        id: '442a1f18-c0d0-4536-aad6-f9a19b2dc008',
                                        value: {
                                            centAmount: 31850,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'ba0d6ccb-0aa2-434c-9030-bb88b68e2aa0', typeId: 'channel' },
                                        id: 'aaf1a669-2849-46ff-a427-f7df28afabe9',
                                        value: {
                                            centAmount: 39000,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'e003b8b9-2562-4993-8ddb-bbf5cde94641', typeId: 'channel' },
                                        country: 'US',
                                        id: '2ab509be-f8df-4e86-81cb-b49adbc3c437',
                                        value: {
                                            centAmount: 35100,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: '3cb3f673-9805-4e21-9e00-afa1246121da', typeId: 'channel' },
                                        country: 'US',
                                        id: '743d698b-e25d-40a4-ac77-011f7b9fab71',
                                        value: {
                                            centAmount: 34775,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: '9a32dc0d-4aa0-4423-8c4d-1389cb22aa72', typeId: 'channel' },
                                        country: 'US',
                                        id: '5bb4934a-e065-4959-bd81-f7a158468c4c',
                                        value: {
                                            centAmount: 34125,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                ],
                                sku: 'A0E200000001YNN',
                            },
                        },
                        {
                            addedAt: '2023-02-09T10:02:50.192Z',
                            discountedPricePerQuantity: [],
                            id: 'ba3a2f30-bee0-4bb1-9300-403a941d6e1e',
                            lastModifiedAt: '2023-02-09T10:02:50.192Z',
                            lineItemMode: 'Standard',
                            name: { en: 'Product Name' },
                            perMethodTaxRate: [],
                            price: {
                                id: 'c3be288f-fd4d-4965-a35d-205fb02ae1e0',
                                value: {
                                    centAmount: 10250,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            priceMode: 'Platform',
                            productId: '346a4513-82ee-4aea-90e0-2e7ded859e77',
                            productKey: '79371',
                            productType: {
                                id: 'a6408130-1800-4cb3-9332-14d27879d929',
                                typeId: 'product-type',
                                version: 1,
                            },
                            quantity: 1,
                            state: [
                                { quantity: 1, state: { id: '3d45b624-3e5b-410c-a9b1-22a7987a7cdf', typeId: 'state' } },
                            ],
                            taxedPricePortions: [],
                            totalPrice: {
                                centAmount: 10250,
                                currencyCode: 'EUR',
                                fractionDigits: 2,
                                type: 'centPrecision',
                            },
                            variant: {
                                assets: [],
                                attributes: [
                                    { name: 'articleNumberManufacturer', value: 'JC5519PP1KLV0500 ROSSO' },
                                    { name: 'articleNumberMax', value: '79371' },
                                    { name: 'matrixId', value: 'A0E2000000021UK' },
                                    { name: 'baseId', value: '79371' },
                                    { name: 'designer', value: { key: 'moschinolove', label: 'Moschino Love' } },
                                    { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
                                    { name: 'commonSize', value: { key: 'oneSize', label: 'one Size' } },
                                    { name: 'size', value: 'one size' },
                                    {
                                        name: 'color',
                                        value: { key: 'red', label: { de: 'rot', en: 'red', it: 'rosso' } },
                                    },
                                    { name: 'colorFreeDefinition', value: { de: 'rot', en: 'red' } },
                                    { name: 'style', value: { key: 'sporty', label: 'sporty' } },
                                    { name: 'gender', value: { key: 'women', label: 'Damen' } },
                                    { name: 'season', value: 's15' },
                                    { name: 'isOnStock', value: true },
                                ],
                                id: 1,
                                images: [
                                    {
                                        dimensions: { h: 0, w: 0 },
                                        url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/079371_1_medium.jpg',
                                    },
                                ],
                                key: 'A0E2000000021UK',
                                prices: [
                                    {
                                        id: '03b1b802-2490-47a9-a742-a3c9a3c756c3',
                                        value: {
                                            centAmount: 10250,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        customerGroup: {
                                            id: '3dc582f5-e5a5-493a-ae4d-726356542a7b',
                                            typeId: 'customer-group',
                                        },
                                        id: 'ae65f1f6-4a9a-4021-81f6-555c7223643e',
                                        value: {
                                            centAmount: 6721,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        country: 'US',
                                        id: 'de262523-f3b4-4cd7-a31a-6fcdc52f81c8',
                                        value: {
                                            centAmount: 10250,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        customerGroup: {
                                            id: '3dc582f5-e5a5-493a-ae4d-726356542a7b',
                                            typeId: 'customer-group',
                                        },
                                        id: '2dd29e3e-9921-4957-baee-27d8d39aa726',
                                        value: {
                                            centAmount: 6721,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        country: 'DE',
                                        id: '2402ed64-4527-4f4b-aaba-7208a1732963',
                                        value: {
                                            centAmount: 8200,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        country: 'IT',
                                        id: '8292bb63-4cf8-4fc0-ba8b-b361bfa5d6d5',
                                        value: {
                                            centAmount: 8200,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        country: 'GB',
                                        id: 'b483060a-6d72-4c48-8cd1-c5085c3c8a59',
                                        value: {
                                            centAmount: 8200,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'd79fcace-9711-4665-833d-c80be68dbb01', typeId: 'channel' },
                                        country: 'DE',
                                        id: '20730f13-5ace-451d-a27e-22f3fe31cd74',
                                        value: {
                                            centAmount: 7544,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'f9a9e6ab-7f3b-469b-abf4-d3422d54bdeb', typeId: 'channel' },
                                        id: 'c37dc435-a5dc-4408-9dbb-8155a947898e',
                                        value: {
                                            centAmount: 9840,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: '4acdd01d-db26-4f6f-92c0-cc42b7ed403f', typeId: 'channel' },
                                        country: 'DE',
                                        id: 'ff5bc077-f1ab-475b-988c-4b64f7f875c4',
                                        value: {
                                            centAmount: 8364,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: '75ab4f19-9eb9-4c8d-8ace-ad7a822958ed', typeId: 'channel' },
                                        country: 'DE',
                                        id: '29e95cef-e5c7-4c55-bafe-15ff5f2f21a1',
                                        value: {
                                            centAmount: 8774,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'd6085a8c-d42b-4e24-a51f-370edebfbbdf', typeId: 'channel' },
                                        country: 'DE',
                                        id: 'be31bd24-af7e-48eb-bd39-954e4a850b0c',
                                        value: {
                                            centAmount: 7380,
                                            currencyCode: 'EUR',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'c04d75ca-f367-4bef-baa5-5790dd931707', typeId: 'channel' },
                                        country: 'US',
                                        id: 'abcc437d-fdbf-4a23-9675-e26eca36fd96',
                                        value: {
                                            centAmount: 7544,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'ba0d6ccb-0aa2-434c-9030-bb88b68e2aa0', typeId: 'channel' },
                                        id: '3243e34e-0de9-47fa-a64a-e829e64e8c2f',
                                        value: {
                                            centAmount: 9840,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: 'e003b8b9-2562-4993-8ddb-bbf5cde94641', typeId: 'channel' },
                                        country: 'US',
                                        id: '9b3ccf85-606f-4744-9a00-e3436df0dde7',
                                        value: {
                                            centAmount: 8364,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: '3cb3f673-9805-4e21-9e00-afa1246121da', typeId: 'channel' },
                                        country: 'US',
                                        id: '2e9aa8fd-74da-446d-8a1e-682f27ff2ca0',
                                        value: {
                                            centAmount: 8774,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                    {
                                        channel: { id: '9a32dc0d-4aa0-4423-8c4d-1389cb22aa72', typeId: 'channel' },
                                        country: 'US',
                                        id: 'c9e7ac4e-53fc-4bb6-8bb7-19b351ec8433',
                                        value: {
                                            centAmount: 7380,
                                            currencyCode: 'USD',
                                            fractionDigits: 2,
                                            type: 'centPrecision',
                                        },
                                    },
                                ],
                                sku: 'A0E2000000021UK',
                            },
                        },
                    ],
                    ItemNames: ['Product Name'],
                    Categories: ['Test Category 1'],
                    lastModifiedAt: '2023-02-09T10:02:50.207Z',
                    orderId: '1911fef0-131a-4802-802c-711d959c2590',
                    orderState: 'Open',
                    totalPrice: { centAmount: 50875, currencyCode: 'EUR', fractionDigits: 2, type: 'centPrecision' },
                    version: 1,
                },
                time: '2023-02-09T10:02:50.207Z',
                unique_id: '1911fef0-131a-4802-802c-711d959c2590',
                value: 508.75,
            },
            type: 'event',
        });
        const nockKlaviyoEvent2 = klaviyoEventNock({
            attributes: {
                metric: { name: 'Ordered Product' },
                profile: { email: 'testuser1@klaviyo.com' },
                properties: {
                    addedAt: '2023-02-09T10:02:50.192Z',
                    discountedPricePerQuantity: [],
                    id: 'dd853ebf-b35d-454e-9c6c-703479df6cbd',
                    lastModifiedAt: '2023-02-09T10:02:50.192Z',
                    lineItemMode: 'Standard',
                    name: { en: 'Product Name' },
                    perMethodTaxRate: [],
                    price: {
                        id: '0853898a-2f36-44f5-8f1b-c20775ab6467',
                        value: { centAmount: 40625, currencyCode: 'EUR', fractionDigits: 2, type: 'centPrecision' },
                    },
                    priceMode: 'Platform',
                    productId: '2d69d31e-cccc-450d-83c8-aa27c2a0a620',
                    productKey: '72997',
                    productType: { id: 'a6408130-1800-4cb3-9332-14d27879d929', typeId: 'product-type', version: 1 },
                    quantity: 1,
                    state: [{ quantity: 1, state: { id: '3d45b624-3e5b-410c-a9b1-22a7987a7cdf', typeId: 'state' } }],
                    taxedPricePortions: [],
                    totalPrice: { centAmount: 40625, currencyCode: 'EUR', fractionDigits: 2, type: 'centPrecision' },
                    variant: {
                        assets: [],
                        attributes: [
                            { name: 'articleNumberManufacturer', value: '30S4GTVS6L 230 LUG' },
                            { name: 'articleNumberMax', value: '72997' },
                            { name: 'matrixId', value: 'A0E200000001YNN' },
                            { name: 'baseId', value: '72997' },
                            { name: 'designer', value: { key: 'michaelkors', label: 'Michael Kors' } },
                            { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
                            { name: 'commonSize', value: { key: 'oneSize', label: 'one Size' } },
                            { name: 'size', value: 'one size' },
                            {
                                name: 'color',
                                value: { key: 'brown', label: { de: 'braun', en: 'brown', it: 'marrone' } },
                            },
                            { name: 'colorFreeDefinition', value: { de: 'luggage', en: 'luggage' } },
                            { name: 'style', value: { key: 'sporty', label: 'sporty' } },
                            { name: 'gender', value: { key: 'women', label: 'Damen' } },
                            { name: 'season', value: 's15' },
                        ],
                        id: 1,
                        images: [
                            {
                                dimensions: { h: 0, w: 0 },
                                url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/072997_1_large.jpg',
                            },
                        ],
                        key: 'A0E200000001YNN',
                        prices: [
                            {
                                id: '66e65866-50cb-487d-b092-7de6e8e4f9a9',
                                value: {
                                    centAmount: 40625,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                customerGroup: { id: '3dc582f5-e5a5-493a-ae4d-726356542a7b', typeId: 'customer-group' },
                                id: '6f603a55-39b5-4109-a52b-a798faa930ed',
                                value: {
                                    centAmount: 26639,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                country: 'US',
                                id: '732c27eb-34b8-4160-a352-fff57c340be3',
                                value: {
                                    centAmount: 40625,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                customerGroup: { id: '3dc582f5-e5a5-493a-ae4d-726356542a7b', typeId: 'customer-group' },
                                id: 'fc957081-d800-42a5-9e4c-b2cf0f968d32',
                                value: {
                                    centAmount: 26639,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                country: 'DE',
                                id: '349ada18-6889-49a8-8dec-191589b509e6',
                                value: {
                                    centAmount: 32500,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                country: 'IT',
                                id: 'f33f6bd7-5156-42f8-9bfa-99536b6a3319',
                                value: {
                                    centAmount: 32500,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                country: 'GB',
                                id: '84ea9651-a3f9-412e-afbb-e57c639f1986',
                                value: {
                                    centAmount: 32500,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'd79fcace-9711-4665-833d-c80be68dbb01', typeId: 'channel' },
                                country: 'DE',
                                id: '79a09808-5904-4a50-96a9-1e3b570e4e47',
                                value: {
                                    centAmount: 31850,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'f9a9e6ab-7f3b-469b-abf4-d3422d54bdeb', typeId: 'channel' },
                                id: '19bb9e86-06e1-441b-86de-3a3b10e59a62',
                                value: {
                                    centAmount: 39000,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: '4acdd01d-db26-4f6f-92c0-cc42b7ed403f', typeId: 'channel' },
                                country: 'DE',
                                id: 'd4ed1a7a-f886-4aeb-8bfd-910e83112701',
                                value: {
                                    centAmount: 35100,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: '75ab4f19-9eb9-4c8d-8ace-ad7a822958ed', typeId: 'channel' },
                                country: 'DE',
                                id: '25bb5671-a606-4b31-a4d9-ec166f33e006',
                                value: {
                                    centAmount: 34775,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'd6085a8c-d42b-4e24-a51f-370edebfbbdf', typeId: 'channel' },
                                country: 'DE',
                                id: '98982a79-1251-4701-8b5a-ef5f710a2a60',
                                value: {
                                    centAmount: 34125,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'c04d75ca-f367-4bef-baa5-5790dd931707', typeId: 'channel' },
                                country: 'US',
                                id: '442a1f18-c0d0-4536-aad6-f9a19b2dc008',
                                value: {
                                    centAmount: 31850,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'ba0d6ccb-0aa2-434c-9030-bb88b68e2aa0', typeId: 'channel' },
                                id: 'aaf1a669-2849-46ff-a427-f7df28afabe9',
                                value: {
                                    centAmount: 39000,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'e003b8b9-2562-4993-8ddb-bbf5cde94641', typeId: 'channel' },
                                country: 'US',
                                id: '2ab509be-f8df-4e86-81cb-b49adbc3c437',
                                value: {
                                    centAmount: 35100,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: '3cb3f673-9805-4e21-9e00-afa1246121da', typeId: 'channel' },
                                country: 'US',
                                id: '743d698b-e25d-40a4-ac77-011f7b9fab71',
                                value: {
                                    centAmount: 34775,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: '9a32dc0d-4aa0-4423-8c4d-1389cb22aa72', typeId: 'channel' },
                                country: 'US',
                                id: '5bb4934a-e065-4959-bd81-f7a158468c4c',
                                value: {
                                    centAmount: 34125,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                        ],
                        sku: 'A0E200000001YNN',
                    },
                },
                time: '2023-02-09T10:02:51.207Z',
                unique_id: 'dd853ebf-b35d-454e-9c6c-703479df6cbd',
                value: 406.25,
            },
            type: 'event',
        });
        const nockKlaviyoEvent3 = klaviyoEventNock({
            attributes: {
                metric: { name: 'Ordered Product' },
                profile: { email: 'testuser1@klaviyo.com' },
                properties: {
                    addedAt: '2023-02-09T10:02:50.192Z',
                    discountedPricePerQuantity: [],
                    id: 'ba3a2f30-bee0-4bb1-9300-403a941d6e1e',
                    lastModifiedAt: '2023-02-09T10:02:50.192Z',
                    lineItemMode: 'Standard',
                    name: { en: 'Product Name' },
                    perMethodTaxRate: [],
                    price: {
                        id: 'c3be288f-fd4d-4965-a35d-205fb02ae1e0',
                        value: { centAmount: 10250, currencyCode: 'EUR', fractionDigits: 2, type: 'centPrecision' },
                    },
                    priceMode: 'Platform',
                    productId: '346a4513-82ee-4aea-90e0-2e7ded859e77',
                    productKey: '79371',
                    productType: { id: 'a6408130-1800-4cb3-9332-14d27879d929', typeId: 'product-type', version: 1 },
                    quantity: 1,
                    state: [{ quantity: 1, state: { id: '3d45b624-3e5b-410c-a9b1-22a7987a7cdf', typeId: 'state' } }],
                    taxedPricePortions: [],
                    totalPrice: { centAmount: 10250, currencyCode: 'EUR', fractionDigits: 2, type: 'centPrecision' },
                    variant: {
                        assets: [],
                        attributes: [
                            { name: 'articleNumberManufacturer', value: 'JC5519PP1KLV0500 ROSSO' },
                            { name: 'articleNumberMax', value: '79371' },
                            { name: 'matrixId', value: 'A0E2000000021UK' },
                            { name: 'baseId', value: '79371' },
                            { name: 'designer', value: { key: 'moschinolove', label: 'Moschino Love' } },
                            { name: 'madeInItaly', value: { key: 'no', label: 'no' } },
                            { name: 'commonSize', value: { key: 'oneSize', label: 'one Size' } },
                            { name: 'size', value: 'one size' },
                            { name: 'color', value: { key: 'red', label: { de: 'rot', en: 'red', it: 'rosso' } } },
                            { name: 'colorFreeDefinition', value: { de: 'rot', en: 'red' } },
                            { name: 'style', value: { key: 'sporty', label: 'sporty' } },
                            { name: 'gender', value: { key: 'women', label: 'Damen' } },
                            { name: 'season', value: 's15' },
                            { name: 'isOnStock', value: true },
                        ],
                        id: 1,
                        images: [
                            {
                                dimensions: { h: 0, w: 0 },
                                url: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/079371_1_medium.jpg',
                            },
                        ],
                        key: 'A0E2000000021UK',
                        prices: [
                            {
                                id: '03b1b802-2490-47a9-a742-a3c9a3c756c3',
                                value: {
                                    centAmount: 10250,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                customerGroup: { id: '3dc582f5-e5a5-493a-ae4d-726356542a7b', typeId: 'customer-group' },
                                id: 'ae65f1f6-4a9a-4021-81f6-555c7223643e',
                                value: {
                                    centAmount: 6721,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                country: 'US',
                                id: 'de262523-f3b4-4cd7-a31a-6fcdc52f81c8',
                                value: {
                                    centAmount: 10250,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                customerGroup: { id: '3dc582f5-e5a5-493a-ae4d-726356542a7b', typeId: 'customer-group' },
                                id: '2dd29e3e-9921-4957-baee-27d8d39aa726',
                                value: {
                                    centAmount: 6721,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                country: 'DE',
                                id: '2402ed64-4527-4f4b-aaba-7208a1732963',
                                value: {
                                    centAmount: 8200,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                country: 'IT',
                                id: '8292bb63-4cf8-4fc0-ba8b-b361bfa5d6d5',
                                value: {
                                    centAmount: 8200,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                country: 'GB',
                                id: 'b483060a-6d72-4c48-8cd1-c5085c3c8a59',
                                value: {
                                    centAmount: 8200,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'd79fcace-9711-4665-833d-c80be68dbb01', typeId: 'channel' },
                                country: 'DE',
                                id: '20730f13-5ace-451d-a27e-22f3fe31cd74',
                                value: {
                                    centAmount: 7544,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'f9a9e6ab-7f3b-469b-abf4-d3422d54bdeb', typeId: 'channel' },
                                id: 'c37dc435-a5dc-4408-9dbb-8155a947898e',
                                value: {
                                    centAmount: 9840,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: '4acdd01d-db26-4f6f-92c0-cc42b7ed403f', typeId: 'channel' },
                                country: 'DE',
                                id: 'ff5bc077-f1ab-475b-988c-4b64f7f875c4',
                                value: {
                                    centAmount: 8364,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: '75ab4f19-9eb9-4c8d-8ace-ad7a822958ed', typeId: 'channel' },
                                country: 'DE',
                                id: '29e95cef-e5c7-4c55-bafe-15ff5f2f21a1',
                                value: {
                                    centAmount: 8774,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'd6085a8c-d42b-4e24-a51f-370edebfbbdf', typeId: 'channel' },
                                country: 'DE',
                                id: 'be31bd24-af7e-48eb-bd39-954e4a850b0c',
                                value: {
                                    centAmount: 7380,
                                    currencyCode: 'EUR',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'c04d75ca-f367-4bef-baa5-5790dd931707', typeId: 'channel' },
                                country: 'US',
                                id: 'abcc437d-fdbf-4a23-9675-e26eca36fd96',
                                value: {
                                    centAmount: 7544,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'ba0d6ccb-0aa2-434c-9030-bb88b68e2aa0', typeId: 'channel' },
                                id: '3243e34e-0de9-47fa-a64a-e829e64e8c2f',
                                value: {
                                    centAmount: 9840,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: 'e003b8b9-2562-4993-8ddb-bbf5cde94641', typeId: 'channel' },
                                country: 'US',
                                id: '9b3ccf85-606f-4744-9a00-e3436df0dde7',
                                value: {
                                    centAmount: 8364,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: '3cb3f673-9805-4e21-9e00-afa1246121da', typeId: 'channel' },
                                country: 'US',
                                id: '2e9aa8fd-74da-446d-8a1e-682f27ff2ca0',
                                value: {
                                    centAmount: 8774,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                            {
                                channel: { id: '9a32dc0d-4aa0-4423-8c4d-1389cb22aa72', typeId: 'channel' },
                                country: 'US',
                                id: 'c9e7ac4e-53fc-4bb6-8bb7-19b351ec8433',
                                value: {
                                    centAmount: 7380,
                                    currencyCode: 'USD',
                                    fractionDigits: 2,
                                    type: 'centPrecision',
                                },
                            },
                        ],
                        sku: 'A0E2000000021UK',
                    },
                },
                time: '2023-02-09T10:02:52.207Z',
                unique_id: 'ba3a2f30-bee0-4bb1-9300-403a941d6e1e',
                value: 102.5,
            },
            type: 'event',
        });

        const ordersSync = new OrdersSync(
            new CTCustomObjectLockService(getApiRoot()),
            new DefaultOrderMapper(new DummyCurrencyService(), new DefaultCustomerMapper()),
            new KlaviyoSdkService(),
            new DefaultCtOrderService(getApiRoot()),
            new DefaultCtProductService(getApiRoot()),
        );
        await ordersSync.syncAllOrders();

        nock.cleanAll();

        expect(nockCtGetCustomObject.isDone()).to.be.true;
        expect(nockCtCreateCustomObject.isDone()).to.be.true;
        expect(nockCtDeleteCustomObject.isDone()).to.be.true;
        expect(nockCtGetAllOrders.isDone()).to.be.true;
        expect(nockCtGetProductsByIdRange1.isDone()).to.be.true;
        expect(nockKlaviyoEvent1.isDone()).to.be.true;
        expect(nockKlaviyoEvent2.isDone()).to.be.true;
        expect(nockKlaviyoEvent3.isDone()).to.be.true;
        expect(nock.activeMocks().length).to.eq(0);
    }, 10000);
});
