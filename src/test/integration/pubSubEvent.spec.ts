import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../adapter/cloudRunAdapter';
import { OrderCreatedMessage } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/message';
import { klaviyoCreateEventNock } from '../nocks/KlaviyoCreateEventNock';

chai.use(chaiHttp);

describe('pubSub adapter event', () => {
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
    it('should return status 204 when the request is valid', (done) => {
        const data = { resource: { typeId: 'customer' } };
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
        const data: OrderCreatedMessage = {
            id: '123123123',
            version: 11,
            createdAt: '2023-01-18 09:23:00',
            lastModifiedAt: '2023-01-18 09:23:00',
            sequenceNumber: 245,
            resourceVersion: 23,
            resource: { typeId: 'order', id: '123-456-789' },
            type: 'OrderCreated',
            order: {
                customerId: '123-123-123',
                customerEmail: 'test@klaviyo.com',
                id: '3456789',
                version: 24,
                createdAt: '2023-01-18 09:23:00',
                lastModifiedAt: '2023-01-18 10:36:00',
                lineItems: [],
                customLineItems: [],
                totalPrice: { type: 'centPrecision', centAmount: 1300, currencyCode: 'USD', fractionDigits: 2 },
                shipping: [],
                shippingMode: 'Single',
                orderState: 'Open',
                syncInfo: [],
                origin: 'Customer',
                refusedGifts: [],
            },
        };

        const createEventNock = klaviyoCreateEventNock({
            type: 'event',
            attributes: {
                profile: { $email: 'test@klaviyo.com' },
                metric: { name: 'Order created' },
                value: 1300,
                properties: {
                    ...data.order,
                },
                unique_id: '3456789',
            },
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(createEventNock.isDone()).to.be.true;
                done();
            });
    });
});
