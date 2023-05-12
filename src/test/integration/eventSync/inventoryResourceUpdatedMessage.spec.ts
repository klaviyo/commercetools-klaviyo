import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../../infrastructure/driving/adapter/eventSync/pubsubAdapter';
import {
    sampleInventoryCreatedMessage,
    sampleInventoryResourceUpdatedMessage,
} from '../../testData/ctInventoryMessages';
import http from 'http';
import { ctAuthNock, ctGetInventoryEntryByIdNock } from '../nocks/commercetoolsNock';
import {
    klaviyoUpdateVariantNock,
    klaviyoGetCatalogueVariantsNock,
    klaviyoGetCatalogueVariantsWithoutItemNock,
} from '../nocks/KlaviyoCatalogueNock';
import nock from 'nock';

chai.use(chaiHttp);

describe('pubSub adapter inventory resource updated message', () => {
    let server: http.Server;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        nock.cleanAll();
    });

    it('should update the inventory in klaviyo and return status code 204 when a inventory resource updated message is received from CT', (done) => {
        const authNock = ctAuthNock();
        const getInventoryEntryNock = ctGetInventoryEntryByIdNock(
            sampleInventoryResourceUpdatedMessage.resource.id,
            undefined,
            200,
        );
        const getKlaviyoGetVariantsNock = klaviyoGetCatalogueVariantsWithoutItemNock(200, {
            data: [
                {
                    id: '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
                },
            ],
        });
        const updateKlaviyoVariantNock = klaviyoUpdateVariantNock(
            '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
            {
                data: {
                    type: 'catalog-variant',
                    id: '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
                    attributes: {
                        inventory_policy: 1,
                        inventory_quantity: 100,
                        published: true,
                    },
                },
            },
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleInventoryResourceUpdatedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                expect(authNock.isDone()).to.be.true;
                expect(getInventoryEntryNock.isDone()).to.be.true;
                expect(getKlaviyoGetVariantsNock.isDone()).to.be.true;
                expect(updateKlaviyoVariantNock.isDone()).to.be.true;
                done();
            });
    });

    it('should return status code 202 and not send the event to klaviyo when the get inventory call to CT fails with status code 400', (done) => {
        const authNock = ctAuthNock();
        const getInventoryEntryNock = ctGetInventoryEntryByIdNock(
            sampleInventoryResourceUpdatedMessage.resource.id,
            undefined,
            400,
        );
        const getKlaviyoGetVariantsNock = klaviyoGetCatalogueVariantsWithoutItemNock(200, {
            data: [
                {
                    id: '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
                },
            ],
        });
        const updateKlaviyoVariantNock = klaviyoUpdateVariantNock(
            '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
            {
                data: {
                    type: 'catalog-variant',
                    id: '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
                    attributes: {
                        inventory_policy: 1,
                        inventory_quantity: 100,
                        published: true,
                    },
                },
            },
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleInventoryResourceUpdatedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(202);
                expect(authNock.isDone()).to.be.true;
                expect(getInventoryEntryNock.isDone()).to.be.true;
                expect(getKlaviyoGetVariantsNock.isDone()).to.be.false;
                expect(updateKlaviyoVariantNock.isDone()).to.be.false;
                done();
            });
    });

    it('should return status code 500 when fails to get the variants in Klaviyo with a 5xx error', (done) => {
        const authNock = ctAuthNock();
        const getInventoryEntryNock = ctGetInventoryEntryByIdNock(
            sampleInventoryResourceUpdatedMessage.resource.id,
            undefined,
            200,
        );
        const getKlaviyoGetVariantsNock = klaviyoGetCatalogueVariantsWithoutItemNock(500, {
            data: [
                {
                    id: '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
                },
            ],
        });
        const updateKlaviyoVariantNock = klaviyoUpdateVariantNock(
            '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
            {
                data: {
                    type: 'catalog-variant',
                    id: '920d4485-5f6e-4eaf-8c1a-6cebe6e0420f',
                    attributes: {
                        inventory_policy: 1,
                        inventory_quantity: 100,
                        published: true,
                    },
                },
            },
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleInventoryResourceUpdatedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(authNock.isDone()).to.be.true;
                expect(getInventoryEntryNock.isDone()).to.be.true;
                expect(getKlaviyoGetVariantsNock.isDone()).to.be.true;
                expect(res.status).to.eq(500);
                expect(updateKlaviyoVariantNock.isDone()).to.be.false;
                done();
            });
    });
});
