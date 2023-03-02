import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../infrastructure/driving/adapter/eventSync/pubsubAdapter';
import { getSampleCustomerCreatedMessage } from '../testData/ctCustomerMessages';
import http from 'http';
import { klaviyoCreateProfileNock, klaviyoPatchProfileNock } from './nocks/KlaviyoProfileNock';

chai.use(chaiHttp);

describe('pubSub adapter customer event', () => {
    let server: http.Server;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll((done) => {
        server.close(() => {
            done();
        });
    });

    it('should return status 204 when the request is valid and the profile is sent to klaviyo', (done) => {
        // nock.recorder.rec();
        const createProfileNock = klaviyoCreateProfileNock({
            type: 'profile',
            attributes: {
                email: 'roberto.smith@klaviyo.com',
                external_id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
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
                phone_number: '+4407476588266',
            },
        });
        // const getKlaviyoGetProfilesNock = klaviyoGetProfilesNock(200, true);

        const inputMessage = getSampleCustomerCreatedMessage();
        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                // expect(getKlaviyoGetProfilesNock.isDone()).to.be.true;
                expect(createProfileNock.isDone()).to.be.true;
                done();
            });
    });

    it('should update the profile in klaviyo and return status 204 when the request is valid and the profile already exists in klaviyo', (done) => {
        // nock.recorder.rec();
        const createProfileNock = klaviyoCreateProfileNock(
            {
                type: 'profile',
                attributes: {
                    email: 'roberto.smith@klaviyo.com',
                    external_id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
                    first_name: 'Roberto',
                    last_name: 'Smith',
                    title: 'Mr',
                    phone_number: '+4407476588266',
                    organization: 'Klaviyo',
                    location: {
                        address1: 'C, Tall Tower, 23, High Road',
                        address2: 'private access, additional address info',
                        city: 'London',
                        country: 'UK',
                        region: 'aRegion',
                        zip: 'WE1 2DP',
                    },
                },
            },
            409,
            {
                errors: [
                    {
                        id: '52efbd49-28fc-4e3f-bc47-da412fec2b96',
                        status: 409,
                        code: 'duplicate_profile',
                        title: 'Conflict.',
                        detail: 'A profile already exists with one of these identifiers.',
                        source: { pointer: '/data/attributes' },
                        meta: { duplicate_profile_id: '01GRKR887TDV7JS4JGM003ANYJ' },
                    },
                ],
            },
        );
        const updateProfileNock = klaviyoPatchProfileNock();

        const inputMessage = getSampleCustomerCreatedMessage();
        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                expect(createProfileNock.isDone()).to.be.true;
                expect(updateProfileNock.isDone()).to.be.true;
                done();
            });
    });

    it('should return status 202 when the user profile phone number is invalid', (done) => {
        // nock.recorder.rec();
        const createProfileNock = klaviyoCreateProfileNock(
            {
                type: 'profile',
                attributes: {
                    email: 'roberto.smith@klaviyo.com',
                    external_id: 'e54d8233-be41-4ce0-ae68-5d0674dd8517',
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
                    phone_number: '+440128472834',
                },
            },
            400,
        );

        const inputMessage = getSampleCustomerCreatedMessage();
        inputMessage.customer.addresses.pop();
        inputMessage.customer.addresses.push({
            id: '1235aa3a-5417-4b51-a76c-d6721472531f',
            region: 'aRegion',
            city: 'London',
            country: 'UK',
            phone: '+440128472834',
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
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(202);
                expect(createProfileNock.isDone()).to.be.true;
                done();
            });
    });
});
