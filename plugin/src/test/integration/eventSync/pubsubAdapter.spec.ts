import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import nock from 'nock';
import { pubsubAdapterApp } from '../../../infrastructure/driving/adapter/eventSync/pubsubAdapter';

chai.use(chaiHttp);

describe('pub/sub adapter', () => {
    beforeEach(() => {
        nock.cleanAll();
        jest.clearAllMocks();
    });

    it('should start the pub/sub API server if the APP_TYPE environment variable is not set', (done) => {
        const data = { resource: { typeId: 'non-supported' } };
        const app = pubsubAdapterApp();
        chai.request(app)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                done();
            });
    });

    it('should fail to process message when there is no body', (done) => {
        const app = pubsubAdapterApp();
        chai.request(app)
            .post('/')
            .end((res, err) => {
                expect(err.status).to.eq(400);
                done();
            });
    });

    it('should not start the API server if the APP_TYPE env variable is set to EVENT', (done) => {
        process.env.APP_TYPE = 'EVENT';

        const app = pubsubAdapterApp();
        expect(app).to.not.be.undefined;
        const data = { resource: { typeId: 'non-supported' } };
        chai.request(app)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
            .end((res, err) => {
                delete process.env.APP_TYPE;
                expect(err.status).to.eq(204);
                done();
            });
    });

    it('should not start the API server if the APP_TYPE env variable is set to BULK_IMPORT', (done) => {
        process.env.APP_TYPE = 'BULK_IMPORT';
        const app = pubsubAdapterApp();
        expect(app).to.be.undefined;
        done();
    });
});
