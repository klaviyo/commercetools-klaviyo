import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../adapter/cloudRunAdapter';
import { klaviyoCreateProfileNock } from './nocks/KlaviyoCreateEventNock';
import { sampleCustomerCreatedEvent } from '../testData/customerData';

chai.use(chaiHttp);

describe('pubSub adapter customer event', () => {
    let server: any;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll(() => {
        server.close();
    });

    it('should return status 204 when the request is valid but ignored as message type is not supported', (done) => {
        // nock.recorder.rec();
        const createProfileNock = klaviyoCreateProfileNock({
            type: 'profile',
            attributes: {
                external_id: '2925dd3a-5417-4b51-a76c-d6721472531f',
                email: 'rob.smith@e2x.com',
                first_name: 'Roberto',
                last_name: 'Smith',
                title: 'Mr',
                location: {
                    address1: 'C, Tall Tower, 23, High Road',
                    address2: 'private access, additional address info',
                    city: 'London',
                    country: 'UK',
                    region: 'aRegion',
                    zip: 'WE1 2DP',
                },
                organization: 'Klaviyo',
                phone_number: '+44 0128472834',
            },
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCustomerCreatedEvent)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(createProfileNock.isDone()).to.be.true;
                done();
            });
    });
});
