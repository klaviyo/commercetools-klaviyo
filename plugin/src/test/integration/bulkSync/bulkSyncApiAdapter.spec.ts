import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import nock from 'nock';
import { bulkSyncApiAdapter } from '../../../infrastructure/driving/adapter/bulkSync/bulkSyncApiAdapter';

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
        bulkSyncApiAdapter().then((app) => {
            const data = { resource: { typeId: 'non-supported' } };
            chai.request(app)
                .post('/')
                .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
                .end((res, err) => {
                    done();
                    expect(err.status).to.eq(204);
                });
        });
    });

    it('should not start the API server if the APP_TYPE env variable is set to BULK_IMPORT', (done) => {
        process.env.APP_TYPE = 'BULK_IMPORT';

        bulkSyncApiAdapter().then((app) => {
            expect(app).to.not.be.undefined;
            const data = { resource: { typeId: 'non-supported' } };
            chai.request(app)
                .post('/')
                .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
                .end((res, err) => {
                    done();
                    delete process.env.APP_TYPE;
                    expect(err.status).to.eq(204);
                });
        });
    });

    it('should not start the API server if the APP_TYPE env variable is set to EVENT', () => {
        process.env.APP_TYPE = 'EVENT';
        bulkSyncApiAdapter().then((app) => {
            expect(app).to.be.undefined;
        });
    });
});
