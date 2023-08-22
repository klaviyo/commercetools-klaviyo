import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import nock from 'nock';
import { pubsubAdapter } from '../../../infrastructure/driving/adapter/eventSync/pubsubAdapter';

chai.use(chaiHttp);

describe('pub/sub adapter', () => {
    beforeAll(() => {
        process.env.PUB_SUB_PORT = '0';
    });

    beforeEach(() => {
        nock.cleanAll();
        jest.clearAllMocks();
    });

    it('should start the pub/sub API server if the APP_TYPE environment variable is not set', (done) => {
        pubsubAdapter().then((app) => {
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

    it('should not start the API server if the APP_TYPE env variable is set to EVENT', (done) => {
        process.env.APP_TYPE = 'EVENT';

        pubsubAdapter().then((app) => {
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

    it('should not start the API server if the APP_TYPE env variable is set to BULK_IMPORT', () => {
        process.env.APP_TYPE = 'BULK_IMPORT';
        pubsubAdapter().then((app) => {
            expect(app).to.be.undefined;
        });
    });
});
