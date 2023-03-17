import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../infrastructure/driving/adapter/eventSync/pubsubAdapter';
import { klaviyoDeleteCategoryNock } from './nocks/KlaviyoCategoryNock';
import { sampleCategoryResourceDeletedMessage } from '../testData/ctCategoryMessages';
import nock from 'nock';

chai.use(chaiHttp);

describe('pubSub adapter category resource deleted message', () => {
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

        const deleteEventNock = klaviyoDeleteCategoryNock(
            encodeURIComponent(`$custom:::$default:::${sampleCategoryResourceDeletedMessage.resource.id}`),
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCategoryResourceDeletedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                expect(deleteEventNock.isDone()).to.be.true;
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

        const deleteEventNock = klaviyoDeleteCategoryNock(
            encodeURIComponent(`$custom:::$default:::${sampleCategoryResourceDeletedMessage.resource.id}`),
            500,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCategoryResourceDeletedMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(500);
                expect(deleteEventNock.isDone()).to.be.true;
                done();
            });
    });
});
