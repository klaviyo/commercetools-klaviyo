import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../adapter/cloudRunAdapter';
import { klaviyoCreateEventNock } from './nocks/KlaviyoCreateEventNock';
import { sampleOrderCreatedMessage } from '../testData/orderData';

chai.use(chaiHttp);

describe('pubSub adapter event', () => {
    let server: any;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll(() => {
        server.close();
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

        const createEventNock = klaviyoCreateEventNock({
            type: 'event',
            attributes: {
                profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                metric: { name: 'Order created' },
                value: 13,
                properties: {
                    ...sampleOrderCreatedMessage.order,
                },
                unique_id: '3456789',
                time: '2023-01-27T15:00:00.000Z',
            },
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleOrderCreatedMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
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

    afterAll(() => {
        server.close();
    });

    it('should not acknowledge the message to pub/sub and return status 500 when the request is invalid', (done) => {
        // recorder.rec();

        const createEventNock = klaviyoCreateEventNock(
            {
                type: 'event',
                attributes: {
                    profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                    metric: { name: 'Order created' },
                    value: 13,
                    properties: {
                        ...sampleOrderCreatedMessage.order,
                    },
                    unique_id: '3456789',
                    time: '2023-01-27T15:00:00.000Z',
                },
            },
            500,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleOrderCreatedMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(500);
                expect(createEventNock.isDone()).to.be.true;
                done();
            });
    });
});
