import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../adapter/cloudRunAdapter';
import { klaviyoUpsertClientProfileNock } from './nocks/KlaviyoCreateEventNock';
import { getSampleCustomerCreatedMessage } from '../testData/ctCustomerMessages';
import http from 'http';

chai.use(chaiHttp);

describe('pubSub adapter customer event', () => {
    let server: http.Server;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll(() => {
        server.close();
    });

    it('should return status 204 when the request is valid and the profile is sent to klaviyo', (done) => {
        // nock.recorder.rec();
        const createProfileNock = klaviyoUpsertClientProfileNock({
            type: 'profile',
            attributes: {
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
            meta: {
                identifiers: {
                    external_id: '2925dd3a-5417-4b51-a76c-d6721472530f',
                },
            },
        });
        const inputMessage = getSampleCustomerCreatedMessage();
        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(createProfileNock.isDone()).to.be.true;
                done();
            });
    });

    it('should return status 202 when the user profile phone number is invalid', (done) => {
        const createProfileNock = klaviyoUpsertClientProfileNock(
            {
                type: 'profile',
                attributes: {
                    email: 'rob.smith@e2x.com',
                    first_name: 'Roberto',
                    last_name: 'Smith',
                    title: 'Mr',
                    organization: 'Klaviyo',
                    location: {
                        address1: 'C, Tall Tower, 23, High Road',
                        address2: 'private access, additional address info',
                        city: 'London',
                        country: 'UK',
                        region: 'aRegion',
                        zip: 'WE1 2DP',
                    },
                    phone_number: '1234-123-4123',
                },
                meta: {
                    identifiers: {
                        external_id: '2925dd3a-5417-4b51-a76c-d6721472530f',
                    },
                },
            },
            process.env.KLAVIYO_COMPANY_ID,
            400,
        );

        const inputMessage = getSampleCustomerCreatedMessage();
        inputMessage.customer.addresses.pop();
        inputMessage.customer.addresses.push({
            id: '1235aa3a-5417-4b51-a76c-d6721472531f',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '1234-123-4123',
            postalCode: 'WE1 2DP',
            streetName: 'High Road',
            streetNumber: '23',
            additionalStreetInfo: 'private access',
            building: 'Tall Tower',
            apartment: 'C',
            additionalAddressInfo: 'additional address info',
            state: 'a state',
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(202);
                expect(createProfileNock.isDone()).to.be.true;
                done();
            });
    });
});
