import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../../../infrastructure/driving/adapter/eventSync/pubsubAdapter';
import { sampleCategoryCreatedMessage, sampleCategoryResourceUpdatedMessage } from '../../testData/ctCategoryMessages';
import http from 'http';
import { ctAuthNock, ctGetCategoryByIdNock, ctGetCustomerNock } from '../nocks/commercetoolsNock';
import { klaviyoCreateCategoryNock, klaviyoGetCategoriesNock, klaviyoPatchCategoryNock } from '../nocks/KlaviyoCategoryNock';
import nock from 'nock';

chai.use(chaiHttp);

describe('pubSub adapter category resource updated message', () => {
    let server: http.Server;
    beforeAll(() => {
        server = app.listen(0);
    });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });

    beforeEach(() => {
        jest.clearAllMocks();
        nock.cleanAll();
    });

    it('should update the category in klaviyo and return status code 204 when a category resource updated message is received from CT', (done) => {
        const authNock = ctAuthNock();
        const getCustomerNock = ctGetCategoryByIdNock(sampleCategoryResourceUpdatedMessage.resource.id, 200);
        const getKlaviyoGetCategoriesNock = klaviyoGetCategoriesNock();
        const getKlaviyoPatchCategoryNock = klaviyoPatchCategoryNock();

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCategoryResourceUpdatedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                expect(authNock.isDone()).to.be.true;
                expect(getCustomerNock.isDone()).to.be.true;
                expect(getKlaviyoGetCategoriesNock.isDone()).to.be.true;
                expect(getKlaviyoPatchCategoryNock.isDone()).to.be.true;
                done();
            });
    });

    it('should return status code 202 and not send the event to klaviyo when the get customer call to CT fails with status code 400', (done) => {
        const authNock = ctAuthNock();
        const getCustomerNock = ctGetCategoryByIdNock(sampleCategoryResourceUpdatedMessage.resource.id, 400);
        const getKlaviyoGetCategoriesNock = klaviyoGetCategoriesNock();
        const getKlaviyoPatchCategoryNock = klaviyoPatchCategoryNock();

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCategoryResourceUpdatedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(202);
                expect(authNock.isDone()).to.be.true;
                expect(getCustomerNock.isDone()).to.be.true;
                expect(getKlaviyoGetCategoriesNock.isDone()).to.be.false;
                expect(getKlaviyoPatchCategoryNock.isDone()).to.be.false;
                done();
            });
    });

    it('should return status code 204 and create the category in klaviyo', (done) => {
		const authNock = ctAuthNock();
        const getCategoryByIdNock = ctGetCategoryByIdNock(sampleCategoryResourceUpdatedMessage.resource.id);
        const getKlaviyoGetCategoriesNock = klaviyoGetCategoriesNock(200, true);
        const getKlaviyoCreateCategoryNock = klaviyoCreateCategoryNock({
            type: 'catalog-category',
            attributes: {
                external_id: 'b218c09d-aad7-460b-9da3-d91a4fb8c4b7',
                name: sampleCategoryCreatedMessage.category.name[
                    Object.keys(sampleCategoryCreatedMessage.category.name)[0]
                ],
                integration_type: '$custom',
                catalog_type: '$default',
            },
        });

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCategoryResourceUpdatedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(204);
                expect(authNock.isDone()).to.be.true;
                expect(getCategoryByIdNock.isDone()).to.be.true;
                expect(getKlaviyoGetCategoriesNock.isDone()).to.be.true;
                expect(getKlaviyoCreateCategoryNock.isDone()).to.be.true;
                done();
            });
    });

    it('should return status code 202 when the get profile from Klaviyo fails with status code 400', (done) => {
		const authNock = ctAuthNock();
        const getCategoryNock = ctGetCategoryByIdNock(sampleCategoryResourceUpdatedMessage.resource.id);
        const getKlaviyoGetCategoriesNock = klaviyoGetCategoriesNock(400);

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCategoryResourceUpdatedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(202);
                expect(authNock.isDone()).to.be.true;
                expect(getCategoryNock.isDone()).to.be.true;
                expect(getKlaviyoGetCategoriesNock.isDone()).to.be.true;
                done();
            });
    });

    it('should return status code 500 when fails to get the profile in Klaviyo with a 5xx error', (done) => {
		const authNock = ctAuthNock();
        const getCustomerNock = ctGetCategoryByIdNock(sampleCategoryResourceUpdatedMessage.resource.id);
        const getKlaviyoGetCategoriesNock = klaviyoGetCategoriesNock(500);
        const getKlaviyoPatchCategoryNock = klaviyoPatchCategoryNock();

        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(sampleCategoryResourceUpdatedMessage)) } })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(authNock.isDone()).to.be.true;
                expect(getCustomerNock.isDone()).to.be.true;
                expect(getKlaviyoGetCategoriesNock.isDone()).to.be.true;
                expect(res.status).to.eq(500);
                expect(getKlaviyoPatchCategoryNock.isDone()).to.be.false;
                done();
            });
    });
});
