import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import nock from 'nock';
import { bulkSyncApiAdapterApp } from '../../../infrastructure/driving/adapter/bulkSync/bulkSyncApiAdapter';

chai.use(chaiHttp);

describe('bulk sync adapter', () => {
    beforeAll(() => {
        process.env.BULK_IMPORT_PORT = '0';
    });

    beforeEach(() => {
        nock.cleanAll();
        jest.clearAllMocks();
    });

    it('should start the API server if the APP_TYPE env variable is not set', (done) => {
        const app = bulkSyncApiAdapterApp();
        const data = { resource: { typeId: 'non-supported' } };
        chai.request(app)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
            .end((res, err) => {
                expect(err.status).to.eq(204);
                done();
            });
    });

    it('should not start the API server if the APP_TYPE env variable is set to BULK_IMPORT', (done) => {
        process.env.APP_TYPE = 'BULK_IMPORT';

        const app = bulkSyncApiAdapterApp();
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

    it('should not start the API server if the APP_TYPE env variable is set to EVENT', (done) => {
        process.env.APP_TYPE = 'EVENT';
        const app = bulkSyncApiAdapterApp();
        expect(app).to.be.undefined;
        done();
    });
});
