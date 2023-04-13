import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../../infrastructure/driving/adapter/eventSync/pubsubAdapter';
import { klaviyoCreateCategoryNock } from '../nocks/KlaviyoCategoryNock';
import { sampleCategoryCreatedMessage } from '../../testData/ctCategoryMessages';
import { ctAuthNock, ctGetCategoryByIdNock } from '../nocks/commercetoolsNock';
import nock from 'nock';

chai.use(chaiHttp);

describe('pubSub adapter category created message', () => {
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
        ctAuthNock();
        ctGetCategoryByIdNock('3456789');
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

        const createEventNock = klaviyoCreateCategoryNock({
            type: 'catalog-category',
            attributes: {
                external_id: sampleCategoryCreatedMessage.category.id,
                name: sampleCategoryCreatedMessage.category.name[
                    Object.keys(sampleCategoryCreatedMessage.category.name)[0]
                ],
                integration_type: '$custom',
                catalog_type: '$default',
            },
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCategoryCreatedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                expect(createEventNock.isDone()).to.be.true;
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

        const createEventNock = klaviyoCreateCategoryNock(
            {
                type: 'catalog-category',
                attributes: {
                    external_id: sampleCategoryCreatedMessage.category.id,
                    name: sampleCategoryCreatedMessage.category.name[
                        Object.keys(sampleCategoryCreatedMessage.category.name)[0]
                    ],
                    integration_type: '$custom',
                    catalog_type: '$default',
                },
            },
            500,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCategoryCreatedMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(500);
                expect(createEventNock.isDone()).to.be.true;
                done();
            });
    });
});
