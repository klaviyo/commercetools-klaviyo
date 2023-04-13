import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../../infrastructure/driving/adapter/eventSync/pubsubAdapter';
import { klaviyoDeleteItemNock, klaviyoGetCatalogueVariantsNock, klaviyoDeleteVariantJobNock, klaviyoGetDeleteVariantJobNock } from '../nocks/KlaviyoCatalogueNock';
import { sampleProductResourceDeletedMessage } from '../../testData/ctProductMessages';
import nock from 'nock';

chai.use(chaiHttp);

describe('pubSub adapter product resource deleted message', () => {
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

        const deleteEventNock = klaviyoDeleteItemNock(
            encodeURIComponent(`$custom:::$default:::${sampleProductResourceDeletedMessage.resource.id}`),
        );

        const getVariantsNock = klaviyoGetCatalogueVariantsNock(200, {
            data: [{
                id: 'test-id',
            }],
        });

        const deleteVariantsJobNock = klaviyoDeleteVariantJobNock(
            {
                attributes: {
                    variants: [{
                        type: 'catalog-variant',
                        id: 'test-id',
                    }]
                },
                type: 'catalog-variant-bulk-delete-job',
            },
            202,
            {
                data: {
                    type: 'catalog-variant-bulk-delete-job',
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

        const getDeleteVariantsJobNock = klaviyoGetDeleteVariantJobNock('test-id', 200, {
            data: {
                type: 'catalog-variant-bulk-delete-job',
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

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleProductResourceDeletedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                expect(deleteEventNock.isDone()).to.be.true;
                expect(getVariantsNock.isDone()).to.be.true;
                expect(deleteVariantsJobNock.isDone()).to.be.true;
                expect(getDeleteVariantsJobNock.isDone()).to.be.true;
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

        const deleteEventNock = klaviyoDeleteItemNock(
            encodeURIComponent(`$custom:::$default:::${sampleProductResourceDeletedMessage.resource.id}`),
            500,
        );

        const getVariantsNock = klaviyoGetCatalogueVariantsNock(200, {
            data: [{
                id: 'test-id',
            }],
        });

        const deleteVariantsJobNock = klaviyoDeleteVariantJobNock(
            {
                attributes: {
                    variants: [{
                        type: 'catalog-variant',
                        id: 'test-id',
                    }]
                },
                type: 'catalog-variant-bulk-delete-job',
            },
            202,
            {
                data: {
                    type: 'catalog-variant-bulk-delete-job',
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

        const getDeleteVariantsJobNock = klaviyoGetDeleteVariantJobNock('test-id', 200, {
            data: {
                type: 'catalog-variant-bulk-delete-job',
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

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleProductResourceDeletedMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(500);
                expect(deleteEventNock.isDone()).to.be.true;
                expect(getVariantsNock.isDone()).to.be.true;
                expect(deleteVariantsJobNock.isDone()).to.be.true;
                expect(getDeleteVariantsJobNock.isDone()).to.be.true;
                done();
            });
    });
});
