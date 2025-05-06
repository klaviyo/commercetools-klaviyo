import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../../infrastructure/driving/adapter/eventSync/pubsubAdapter';
import { klaviyoEventNock } from '../nocks/KlaviyoEventNock';
import { sampleOrderWithPaymentMessage } from '../../testData/orderData';
import { samplePaymentTransactionAddedMessage } from '../../testData/ctPaymentMessages';
import {
    ctAuthNock,
    ctGetOrderByPaymentIdNock,
    ctGetPaymentByIdNock,
    getProductsByIdRange,
} from '../nocks/commercetoolsNock';
import { mapAllowedProperties } from '../../../utils/property-mapper';
import { ctGet2Orders } from '../../testData/ctGetOrders';

chai.use(chaiHttp);

describe('pubSub adapter order refunded mesasge', () => {
    let server: any;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    beforeEach(() => {
        ctAuthNock(3);
        ctGetPaymentByIdNock('3456789');
        ctGetOrderByPaymentIdNock('3456789');
        getProductsByIdRange(['2d69d31e-cccc-450d-83c8-aa27c2a0a620'], {
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
                                },
                            },
                        },
                    },
                },
            ],
            count: 0,
        });
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
                profile: {
                    data: { type: 'profile', attributes: { email: 'test@klaviyo.com', external_id: '123-123-123' } },
                },
                metric: { data: { type: 'metric', attributes: { name: 'Refunded Order' } } },
                value: 13,
                properties: {
                    ...mapAllowedProperties('order', {
                        ...sampleOrderWithPaymentMessage.order,
                        lineItems: [
                            {
                                ...ctGet2Orders.results[0].lineItems[0],
                            },
                        ],
                    }),
                    ItemNames: ['Product Name'],
                    Categories: ['Test Category 1'],
                },
                unique_id: '3456789',
                time: new Date('2023-01-27T15:00:00.000Z').toISOString(),
            },
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(samplePaymentTransactionAddedMessage)) } })
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

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    beforeEach(() => {
        ctAuthNock();
        ctAuthNock();
        ctGetPaymentByIdNock('3456789');
        ctGetOrderByPaymentIdNock('3456789');
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

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    beforeEach(() => {
        ctAuthNock(3);
        ctGetPaymentByIdNock('3456789');
        ctGetOrderByPaymentIdNock('3456789');
        getProductsByIdRange(['2d69d31e-cccc-450d-83c8-aa27c2a0a620'], {
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
                                },
                            },
                        },
                    },
                },
            ],
            count: 0,
        });
    });

    it('should not acknowledge the message to pub/sub and return status 500 when the request is invalid', (done) => {
        // recorder.rec();

        const createEventNock = klaviyoEventNock(
            {
                type: 'event',
                attributes: {
                    profile: {
                        data: {
                            type: 'profile',
                            attributes: { email: 'test@klaviyo.com', external_id: '123-123-123' },
                        },
                    },
                    metric: { data: { type: 'metric', attributes: { name: 'Refunded Order' } } },
                    value: 13,
                    properties: {
                        ...mapAllowedProperties('order', {
                            ...sampleOrderWithPaymentMessage.order,
                            lineItems: [
                                {
                                    ...ctGet2Orders.results[0].lineItems[0],
                                },
                            ],
                        }),
                        ItemNames: ['Product Name'],
                        Categories: ['Test Category 1'],
                    },
                    unique_id: '3456789',
                    time: new Date('2023-01-27T15:00:00.000Z').toISOString(),
                },
            },
            500,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(samplePaymentTransactionAddedMessage)) } })
            .end((err, res) => {
                expect(res.status).to.eq(500);
                expect(createEventNock.isDone()).to.be.true;
                done();
            });
    });
});
