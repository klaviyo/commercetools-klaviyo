import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../adapter/cloudRunAdapter';
import { klaviyoEventNock } from './nocks/KlaviyoEventNock';
import { sampleOrderCreatedMessage, sampleReturnInfoSetMessage } from '../testData/orderData';
import { ctAuthNock, ctGetOrderByIdNock } from './nocks/commercetoolsNock';
import { mapAllowedProperties } from '../../utils/property-mapper';

chai.use(chaiHttp);

describe('pubSub adapter event', () => {
    let server: any;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(() => {
        ctAuthNock();
        ctGetOrderByIdNock('3456789');
    });

    it('should return status 204 when the request is valid but ignored as message type is not supported', (done) => {
        const data = { resource: { typeId: 'non-supported' } };
        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                done();
            });
    });

    it('should return status 204 when the request is valid and processed', (done) => {
        // recorder.rec();

        const createEventNock = klaviyoEventNock({
            type: 'event',
            attributes: {
                profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                metric: { name: 'Refunded Order' },
                value: 13,
                properties: {
                    ...mapAllowedProperties('order', { ...sampleOrderCreatedMessage.order }),
                },
                unique_id: '3456789',
                time: '2023-01-18 09:23:00',
            },
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleReturnInfoSetMessage)) } })
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
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(400);
                done();
            });
    });

    it('should return status 400 when the request has no body', (done) => {
        chai.request(server)
            .post('/')
            // .send(undefined)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(400);
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

    beforeEach(() => {
        ctAuthNock();
        ctGetOrderByIdNock('3456789');
    });

    it('should not acknowledge the message to pub/sub and return status 500 when the request is invalid', (done) => {
        // recorder.rec();

        const createEventNock = klaviyoEventNock(
            {
                type: 'event',
                attributes: {
                    profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                    metric: { name: 'Refunded Order' },
                    value: 13,
                    properties: {
                        ...mapAllowedProperties('order', { ...sampleOrderCreatedMessage.order }),
                    },
                    unique_id: '3456789',
                    time: '2023-01-18 09:23:00',
                },
            },
            500,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleReturnInfoSetMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(500);
                expect(createEventNock.isDone()).to.be.true;
                done();
            });
    });
});
