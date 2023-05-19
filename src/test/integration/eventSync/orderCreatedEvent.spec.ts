import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../../infrastructure/driving/adapter/eventSync/pubsubAdapter';
import { klaviyoEventNock } from '../nocks/KlaviyoEventNock';
import { sampleOrderCreatedMessage, sampleOrderCustomerSetMessage } from '../../testData/orderData';
import { ctAuthNock, ctGetOrderByIdNock, getProductsByIdRange } from '../nocks/commercetoolsNock';
import nock from 'nock';
import { mapAllowedProperties } from '../../../utils/property-mapper';
import { ctGet2Orders } from '../../testData/ctGetOrders';

chai.use(chaiHttp);

describe('pubSub adapter order created message', () => {
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

    it('should return status 204 when the request is valid and processed (OrderCreated)', (done) => {
        // recorder.rec();

        ctAuthNock(1);
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

        const createEventNock = klaviyoEventNock({
            type: 'event',
            attributes: {
                profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                metric: { name: 'Placed Order' },
                value: 13,
                properties: {
                    ...mapAllowedProperties('order', {
                        ...sampleOrderCreatedMessage.order,
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
                time: '2023-01-27T15:00:00.000Z',
            },
        });

        const nockKlaviyoEvent1 = klaviyoEventNock({
            attributes: {
                metric: { name: 'Ordered Product' },
                profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                properties: {
                    ...ctGet2Orders.results[0].lineItems[0],
                },
                time: '2023-01-27T15:00:01.000Z',
                unique_id: 'dd853ebf-b35d-454e-9c6c-703479df6cbd',
                value: 406.25,
            },
            type: 'event',
        });

        chai.request(server)
            .post('/')
            .send({
                message: {
                    data: Buffer.from(
                        JSON.stringify({
                            ...sampleOrderCreatedMessage,
                            order: {
                                ...sampleOrderCreatedMessage.order,
                                lineItems: [
                                    {
                                        ...ctGet2Orders.results[0].lineItems[0],
                                    },
                                ],
                            },
                        }),
                    ),
                },
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                expect(createEventNock.isDone()).to.be.true;
                expect(nockKlaviyoEvent1.isDone()).to.be.true;
                done();
            });
    });

    it('should return status 204 when the request is valid and processed (OrderCustomerSet)', (done) => {
        // recorder.rec();

        ctAuthNock(2);
        ctGetOrderByIdNock('3456789');
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

        const createEventNock = klaviyoEventNock({
            type: 'event',
            attributes: {
                profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                metric: { name: 'Placed Order' },
                value: 13,
                properties: {
                    ...mapAllowedProperties('order', {
                        ...sampleOrderCreatedMessage.order,
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
                time: '2023-01-27T15:00:00.000Z',
            },
        });

        const nockKlaviyoEvent1 = klaviyoEventNock({
            attributes: {
                metric: { name: 'Ordered Product' },
                profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                properties: {
                    ...ctGet2Orders.results[0].lineItems[0],
                },
                time: '2023-01-27T15:00:01.000Z',
                unique_id: 'dd853ebf-b35d-454e-9c6c-703479df6cbd',
                value: 406.25,
            },
            type: 'event',
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleOrderCustomerSetMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(createEventNock.isDone()).to.be.true;
                expect(nockKlaviyoEvent1.isDone()).to.be.true;
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

        ctAuthNock(1);
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

        const createEventNock = klaviyoEventNock(
            {
                type: 'event',
                attributes: {
                    profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                    metric: { name: 'Placed Order' },
                    value: 13,
                    properties: {
                        ...mapAllowedProperties('order', {
                            ...sampleOrderCreatedMessage.order,
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
                    time: '2023-01-27T15:00:00.000Z',
                },
            },
            500,
        );

        const nockKlaviyoEvent1 = klaviyoEventNock(
            {
                attributes: {
                    metric: { name: 'Ordered Product' },
                    profile: { $email: 'test@klaviyo.com', $id: '123-123-123' },
                    properties: {
                        ...ctGet2Orders.results[0].lineItems[0],
                    },
                    time: '2023-01-27T15:00:01.000Z',
                    unique_id: 'dd853ebf-b35d-454e-9c6c-703479df6cbd',
                    value: 406.25,
                },
                type: 'event',
            },
            500,
        );

        chai.request(server)
            .post('/')
            .send({
                message: {
                    data: Buffer.from(
                        JSON.stringify({
                            ...sampleOrderCreatedMessage,
                            order: {
                                ...sampleOrderCreatedMessage.order,
                                lineItems: [
                                    {
                                        ...ctGet2Orders.results[0].lineItems[0],
                                    },
                                ],
                            },
                        }),
                    ),
                },
            })
            .end((res, err) => {
                expect(err.status).to.eq(500);
                expect(createEventNock.isDone()).to.be.true;
                expect(nockKlaviyoEvent1.isDone()).to.be.true;
                done();
            });
    });
});
