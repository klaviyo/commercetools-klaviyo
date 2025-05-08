import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../../infrastructure/driving/adapter/eventSync/pubsubAdapter';
import {
    klaviyoUpdateItemNock,
    klaviyoCreateVariantJobNock,
    klaviyoGetItemNock,
    klaviyoGetCatalogueVariantsNock,
    klaviyoGetVariantJobNock,
    klaviyoCreateVariantNock,
} from '../nocks/KlaviyoCatalogueNock';
import { sampleProductPublishedMessage } from '../../testData/ctProductMessages';
import nock from 'nock';
import { ctAuthNock, ctGetProductByIdNock } from '../nocks/commercetoolsNock';

chai.use(chaiHttp);

describe('pubSub adapter product published message', () => {
    let server: any;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(() => {
        nock.cleanAll();
        jest.clearAllMocks();
    });

    it('should return status 204 when the request is valid but ignored as message type is not supported', (done) => {
        const data = { resource: { typeId: 'non-supported' } };
        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                done();
            });
    });

    it('should return status 204 when the request is valid and processed', (done) => {
        // recorder.rec();

        const authNock = ctAuthNock();
        const getProductNock = ctGetProductByIdNock(
            sampleProductPublishedMessage.resource.id,
            {
                id: sampleProductPublishedMessage.resource.id,
                masterData: {
                    current: {
                        ...sampleProductPublishedMessage.productProjection,
                        categories: [
                            {
                                id: 'test',
                                obj: {
                                    id: 'test',
                                    name: {
                                        'en-US': 'Test Category',
                                    },
                                    ancestors: [],
                                },
                            },
                        ],
                    },
                },
            },
            200,
        );

        const getItemNock = klaviyoGetItemNock(
            encodeURIComponent(`$custom:::$default:::${sampleProductPublishedMessage.resource.id}`),
            200,
            {
                data: {
                    id: `$custom:::$default:::${sampleProductPublishedMessage.resource.id}`,
                },
            },
        );

        const getVariantsNock = klaviyoGetCatalogueVariantsNock(
            200,
            {
                data: [],
            },
            encodeURIComponent(sampleProductPublishedMessage.resource.id),
        );

        const updateItemNock = klaviyoUpdateItemNock(
            encodeURIComponent(`$custom:::$default:::${sampleProductPublishedMessage.resource.id}`),
            {
                id: `$custom:::$default:::${sampleProductPublishedMessage.resource.id}`,
                attributes: {
                    description: 'Ideal for small electronics projects',
                    image_full_url:
                        'https://af8624530ae38a966e54-c4324683759a12aace9336b874361505.ssl.cf1.rackcdn.com/relay-5meY_-gN.jpg',
                    price: 5,
                    published: true,
                    title: 'Small AC/DC Relay',
                    url: 'https://example-store.com/products/example-product',
                    custom_metadata: {
                        title_json: '{"title_en":"Small AC/DC Relay"}',
                        slug_json: '{"slug_en":"example-product"}',
                        price_json:
                            '{"price_EUR":5,"price_AD":5,"price_AT":5,"price_AX":5,"price_BE":5,"price_BL":5,"price_CP":5,"price_CY":5,"price_DE":5,"price_EA":5,"price_EE":5,"price_ES":5,"price_EU":5,"price_FI":5,"price_FR":5,"price_FX":5,"price_GF":5,"price_GP":5,"price_GR":5,"price_IC":5,"price_IE":5,"price_IT":5,"price_LT":5,"price_LU":5,"price_LV":5,"price_MC":5,"price_ME":5,"price_MF":5,"price_MQ":5,"price_MT":5,"price_NL":5,"price_PM":5,"price_PT":5,"price_RE":5,"price_SI":5,"price_SK":5,"price_SM":5,"price_TF":5,"price_VA":5,"price_XK":5,"price_YT":5,"price_ZW":5}',
                        currency_json:
                            '{"currency_AD":"EUR","currency_AT":"EUR","currency_AX":"EUR","currency_BE":"EUR","currency_BL":"EUR","currency_CP":"EUR","currency_CY":"EUR","currency_DE":"EUR","currency_EA":"EUR","currency_EE":"EUR","currency_ES":"EUR","currency_EU":"EUR","currency_FI":"EUR","currency_FR":"EUR","currency_FX":"EUR","currency_GF":"EUR","currency_GP":"EUR","currency_GR":"EUR","currency_IC":"EUR","currency_IE":"EUR","currency_IT":"EUR","currency_LT":"EUR","currency_LU":"EUR","currency_LV":"EUR","currency_MC":"EUR","currency_ME":"EUR","currency_MF":"EUR","currency_MQ":"EUR","currency_MT":"EUR","currency_NL":"EUR","currency_PM":"EUR","currency_PT":"EUR","currency_RE":"EUR","currency_SI":"EUR","currency_SK":"EUR","currency_SM":"EUR","currency_TF":"EUR","currency_VA":"EUR","currency_XK":"EUR","currency_YT":"EUR","currency_ZW":"EUR"}',
                    },
                },
                relationships: {
                    categories: {
                        data: [
                            {
                                id: '$custom:::$default:::test',
                                type: 'catalog-category',
                            },
                        ],
                    },
                },
                type: 'catalog-item',
            },
        );

        const createVariantNock = klaviyoCreateVariantNock({
            attributes: {
                catalog_type: '$default',
                description: 'Ideal for small electronics projects',
                external_id: 'EXPROD1',
                image_full_url:
                    'https://af8624530ae38a966e54-c4324683759a12aace9336b874361505.ssl.cf1.rackcdn.com/relay-5meY_-gN.jpg',
                integration_type: '$custom',
                inventory_policy: 1,
                inventory_quantity: 60,
                price: 5,
                published: true,
                sku: 'EXPROD1',
                title: 'Small AC/DC Relay',
                url: 'https://example-store.com/products/example-product',
                custom_metadata: {
                    title_json: '{"title_en":"Small AC/DC Relay"}',
                    slug_json: '{"slug_en":"example-product"}',
                    price_json:
                        '{"price_EUR":5,"price_AD":5,"price_AT":5,"price_AX":5,"price_BE":5,"price_BL":5,"price_CP":5,"price_CY":5,"price_DE":5,"price_EA":5,"price_EE":5,"price_ES":5,"price_EU":5,"price_FI":5,"price_FR":5,"price_FX":5,"price_GF":5,"price_GP":5,"price_GR":5,"price_IC":5,"price_IE":5,"price_IT":5,"price_LT":5,"price_LU":5,"price_LV":5,"price_MC":5,"price_ME":5,"price_MF":5,"price_MQ":5,"price_MT":5,"price_NL":5,"price_PM":5,"price_PT":5,"price_RE":5,"price_SI":5,"price_SK":5,"price_SM":5,"price_TF":5,"price_VA":5,"price_XK":5,"price_YT":5,"price_ZW":5}',
                    currency_json:
                        '{"currency_AD":"EUR","currency_AT":"EUR","currency_AX":"EUR","currency_BE":"EUR","currency_BL":"EUR","currency_CP":"EUR","currency_CY":"EUR","currency_DE":"EUR","currency_EA":"EUR","currency_EE":"EUR","currency_ES":"EUR","currency_EU":"EUR","currency_FI":"EUR","currency_FR":"EUR","currency_FX":"EUR","currency_GF":"EUR","currency_GP":"EUR","currency_GR":"EUR","currency_IC":"EUR","currency_IE":"EUR","currency_IT":"EUR","currency_LT":"EUR","currency_LU":"EUR","currency_LV":"EUR","currency_MC":"EUR","currency_ME":"EUR","currency_MF":"EUR","currency_MQ":"EUR","currency_MT":"EUR","currency_NL":"EUR","currency_PM":"EUR","currency_PT":"EUR","currency_RE":"EUR","currency_SI":"EUR","currency_SK":"EUR","currency_SM":"EUR","currency_TF":"EUR","currency_VA":"EUR","currency_XK":"EUR","currency_YT":"EUR","currency_ZW":"EUR"}',
                },
            },
            relationships: {
                item: {
                    data: {
                        id: '$custom:::$default:::d5d463ef-8701-4823-9413-4dd6032cf581',
                        type: 'catalog-item',
                    },
                },
            },
            type: 'catalog-variant',
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleProductPublishedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                expect(authNock.isDone()).to.be.true;
                expect(getProductNock.isDone()).to.be.true;
                expect(getItemNock.isDone()).to.be.true;
                expect(getVariantsNock.isDone()).to.be.true;
                expect(updateItemNock.isDone()).to.be.true;
                expect(createVariantNock.isDone()).to.be.true;
                done();
            });
    });
});

describe('pubSub event that produces 4xx error', () => {
    let server: any;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll(() => {
        server.close();
    });

    it('should return status 400 when the request is invalid', (done) => {
        chai.request(server)
            .post('/')
            .send({ invalidData: '123' })
            .end((res, err) => {
                expect(err.status).to.eq(400);
                done();
            });
    });

    it('should return status 400 when the request has no body', (done) => {
        chai.request(server)
            .post('/')
            // .send(undefined)
            .end((res, err) => {
                expect(err.status).to.eq(400);
                done();
            });
    });
});

describe('pubSub event that produces 5xx error', () => {
    let server: any;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    it('should not acknowledge the message to pub/sub and return status 500 when the request is invalid', (done) => {
        // recorder.rec();

        const authNock = ctAuthNock();
        const getProductNock = ctGetProductByIdNock(
            sampleProductPublishedMessage.resource.id,
            {
                id: sampleProductPublishedMessage.resource.id,
                masterData: {
                    current: {
                        ...sampleProductPublishedMessage.productProjection,
                        categories: [
                            {
                                id: 'test',
                                obj: {
                                    id: 'test',
                                    name: {
                                        'en-US': 'Test Category',
                                    },
                                    ancestors: [],
                                },
                            },
                        ],
                    },
                },
            },
            500,
        );

        const getItemNock = klaviyoGetItemNock(
            encodeURIComponent(`$custom:::$default:::${sampleProductPublishedMessage.resource.id}`),
            500,
            {
                data: {
                    id: `$custom:::$default:::${sampleProductPublishedMessage.resource.id}`,
                },
            },
        );

        const getVariantsNock = klaviyoGetCatalogueVariantsNock(
            500,
            {
                data: [],
            },
            encodeURIComponent(sampleProductPublishedMessage.resource.id),
        );

        const updateItemNock = klaviyoUpdateItemNock(
            encodeURIComponent(`$custom:::$default:::${sampleProductPublishedMessage.resource.id}`),
            {
                id: `$custom:::$default:::${sampleProductPublishedMessage.resource.id}`,
                attributes: {
                    description: 'Ideal for small electronics projects',
                    image_full_url:
                        'https://af8624530ae38a966e54-c4324683759a12aace9336b874361505.ssl.cf1.rackcdn.com/relay-5meY_-gN.jpg',
                    price: 5,
                    published: true,
                    title: 'Small AC/DC Relay',
                    url: 'https://example-store.com/products/example-product',
                },
                relationships: {
                    categories: {
                        data: [
                            {
                                id: '$custom:::$default:::test',
                                type: 'catalog-category',
                            },
                        ],
                    },
                },
                type: 'catalog-item',
            },
        );

        const createVariantNock = klaviyoCreateVariantNock({
            attributes: {
                catalog_type: '$default',
                description: 'Ideal for small electronics projects',
                external_id: 'EXPROD1',
                image_full_url:
                    'https://af8624530ae38a966e54-c4324683759a12aace9336b874361505.ssl.cf1.rackcdn.com/relay-5meY_-gN.jpg',
                integration_type: '$custom',
                inventory_policy: 1,
                inventory_quantity: 60,
                price: 5,
                published: true,
                sku: 'EXPROD1',
                title: 'Small AC/DC Relay',
                url: 'https://example-store.com/products/example-product',
                custom_metadata: {
                    title_json: '{"title_en":"Small AC/DC Relay"}',
                    slug_json: '{"slug_en":"example-product"}',
                    price_json:
                        '{"price_EUR":5,"price_AD":5,"price_AT":5,"price_AX":5,"price_BE":5,"price_BL":5,"price_CP":5,"price_CY":5,"price_DE":5,"price_EA":5,"price_EE":5,"price_ES":5,"price_EU":5,"price_FI":5,"price_FR":5,"price_FX":5,"price_GF":5,"price_GP":5,"price_GR":5,"price_IC":5,"price_IE":5,"price_IT":5,"price_LT":5,"price_LU":5,"price_LV":5,"price_MC":5,"price_ME":5,"price_MF":5,"price_MQ":5,"price_MT":5,"price_NL":5,"price_PM":5,"price_PT":5,"price_RE":5,"price_SI":5,"price_SK":5,"price_SM":5,"price_TF":5,"price_VA":5,"price_XK":5,"price_YT":5,"price_ZW":5}',
                    currency_json:
                        '{"currency_AD":"EUR","currency_AT":"EUR","currency_AX":"EUR","currency_BE":"EUR","currency_BL":"EUR","currency_CP":"EUR","currency_CY":"EUR","currency_DE":"EUR","currency_EA":"EUR","currency_EE":"EUR","currency_ES":"EUR","currency_EU":"EUR","currency_FI":"EUR","currency_FR":"EUR","currency_FX":"EUR","currency_GF":"EUR","currency_GP":"EUR","currency_GR":"EUR","currency_IC":"EUR","currency_IE":"EUR","currency_IT":"EUR","currency_LT":"EUR","currency_LU":"EUR","currency_LV":"EUR","currency_MC":"EUR","currency_ME":"EUR","currency_MF":"EUR","currency_MQ":"EUR","currency_MT":"EUR","currency_NL":"EUR","currency_PM":"EUR","currency_PT":"EUR","currency_RE":"EUR","currency_SI":"EUR","currency_SK":"EUR","currency_SM":"EUR","currency_TF":"EUR","currency_VA":"EUR","currency_XK":"EUR","currency_YT":"EUR","currency_ZW":"EUR"}',
                },
            },
            relationships: {
                item: {
                    data: {
                        id: '$custom:::$default:::d5d463ef-8701-4823-9413-4dd6032cf581',
                        type: 'catalog-item',
                    },
                },
            },
            type: 'catalog-variant',
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleProductPublishedMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(500);
                expect(authNock.isDone()).to.be.true;
                expect(getProductNock.isDone()).to.be.false;
                expect(getItemNock.isDone()).to.be.true;
                expect(getVariantsNock.isDone()).to.be.false;
                expect(updateItemNock.isDone()).to.be.false;
                expect(createVariantNock.isDone()).to.be.false;
                done();
            });
    });
});
