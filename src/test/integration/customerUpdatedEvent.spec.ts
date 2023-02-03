import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../adapter/cloudRunAdapter';
import {
    getSampleCustomerAddressUpdateMessage,
    getSampleCustomerCompanyNameSetMessage,
    getSampleCustomerFirstNameSetMessage,
    getSampleCustomerLastNameSetMessage,
    getSampleCustomerTitleSetMessage,
} from '../testData/ctCustomerMessages';
import http from 'http';
import { klaviyoUpsertClientProfileNock } from './nocks/KlaviyoCreateEventNock';
import { ctAuthNock, ctGetCustomerNock } from './nocks/commercetoolsNock';
import { Address } from '@commercetools/platform-sdk';

chai.use(chaiHttp);

process.env.KLAVIYO_COMPANY_ID = 'X4XV9d';

describe('pubSub adapter customer updated message', () => {
    let server: http.Server;
    beforeAll(() => {
        server = app.listen(0);
    });

    afterAll(() => {
        server.close();
    });

    it('should update the profile in klaviyo when a customer `first name` set message is received from CT', (done) => {
        const inputMessage = getSampleCustomerFirstNameSetMessage();
        const createProfileNock = klaviyoUpsertClientProfileNock(
            {
                type: 'profile',
                attributes: { first_name: inputMessage.firstName },
                meta: { identifiers: { external_id: inputMessage.resource.id } },
            },
            process.env.KLAVIYO_COMPANY_ID!,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(createProfileNock.isDone()).to.be.true;
                done();
            });
    });

    it('should update the profile in klaviyo when a customer `last name` set message is received from CT', (done) => {
        const inputMessage = getSampleCustomerLastNameSetMessage();
        const createProfileNock = klaviyoUpsertClientProfileNock(
            {
                type: 'profile',
                attributes: { last_name: inputMessage.lastName },
                meta: { identifiers: { external_id: inputMessage.resource.id } },
            },
            process.env.KLAVIYO_COMPANY_ID!,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(createProfileNock.isDone()).to.be.true;
                done();
            });
    });

    it('should update the profile in klaviyo when a customer `title` set message is received from CT', (done) => {
        const inputMessage = getSampleCustomerTitleSetMessage();
        const createProfileNock = klaviyoUpsertClientProfileNock(
            {
                type: 'profile',
                attributes: { title: inputMessage.title },
                meta: { identifiers: { external_id: inputMessage.resource.id } },
            },
            process.env.KLAVIYO_COMPANY_ID!,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(createProfileNock.isDone()).to.be.true;
                done();
            });
    });

    it('should update the profile in klaviyo when a customer `company name` set message is received from CT', (done) => {
        const inputMessage = getSampleCustomerCompanyNameSetMessage();
        const createProfileNock = klaviyoUpsertClientProfileNock(
            {
                type: 'profile',
                attributes: { organization: inputMessage.companyName },
                meta: { identifiers: { external_id: inputMessage.resource.id } },
            },
            process.env.KLAVIYO_COMPANY_ID!,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(createProfileNock.isDone()).to.be.true;
                done();
            });
    });

    it('should update the profile location and phone_number in klaviyo when an address updated message is received from CT', (done) => {
        // nock.recorder.rec();
        const inputMessage = getSampleCustomerAddressUpdateMessage({
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
        const authNock = ctAuthNock();
        const newCtAddress: Address = { ...inputMessage.address, phone: '+4408765477612' };
        const getCustomerNock = ctGetCustomerNock(inputMessage.resource.id, [newCtAddress]);
        const updateProfileLocationNock = klaviyoUpsertClientProfileNock(
            {
                type: 'profile',
                attributes: {
                    phone_number: '+4408765477612',
                    location: {
                        address1: 'C, Tall Tower, 23, High Road',
                        address2: 'private access, additional address info',
                        city: 'London',
                        country: 'UK',
                        region: 'aRegion',
                        zip: 'WE1 2DP',
                    },
                },
                meta: { identifiers: { external_id: inputMessage.resource.id } },
            },
            process.env.KLAVIYO_COMPANY_ID!,
        );

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(inputMessage)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                expect(authNock.isDone()).to.be.true;
                expect(getCustomerNock.isDone()).to.be.true;
                expect(updateProfileLocationNock.isDone()).to.be.true;
                done();
            });
    });
});
