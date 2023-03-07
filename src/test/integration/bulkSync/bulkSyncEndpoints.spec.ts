import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import http from 'http';
const breeRunMock = jest.fn();
const breeStopMock = jest.fn();
import { bulkSyncApp } from '../../../infrastructure/driving/adapter/bulkSync/bulkSyncApiAdapter';

jest.mock('bree', () => {
  return {
     __esModule: true,
     default: function() {
       return {
         run: breeRunMock,
         stop: breeStopMock,
       }
     },
  }
});

chai.use(chaiHttp);

describe('bulkSyncApp order sync endpoint', () => {
    let server: http.Server;
    beforeEach(() => {
        server = bulkSyncApp.listen(0);
    });

    afterEach(async () => {
        await server.close();
    });

    it('should accept the start sync request and return 202', (done) => {
        chai.request(server)
            .post('/sync/orders')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(202);
                done();
            });
    });

    it('should fail to start sync and return 500', (done) => {
        breeRunMock.mockImplementationOnce(() => { throw Error() })
        chai.request(server)
            .post('/sync/orders')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(500);
                done();
            });
    });

    it('should accept the stop sync request and return 202', (done) => {
        chai.request(server)
            .post('/sync/orders/stop')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(202);
                done();
            });
    });

    it('should fail to stop sync and return 500', (done) => {
        breeStopMock.mockImplementationOnce(() => { throw Error() })
        chai.request(server)
            .post('/sync/orders/stop')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(500);
                done();
            });
    });
});

describe('bulkSyncApp customer sync endpoint', () => {
    let server: http.Server;
    beforeEach(() => {
        server = bulkSyncApp.listen(0);
    });

    afterEach(async () => {
        await server.close();
    });

    it('should accept the start sync request and return 202', (done) => {
        chai.request(server)
            .post('/sync/customers')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(202);
                done();
            });
    });

    it('should fail to start sync and return 500', (done) => {
        breeRunMock.mockImplementationOnce(() => { throw Error() })
        chai.request(server)
            .post('/sync/customers')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(500);
                done();
            });
    });

    it('should accept the stop sync request and return 202', (done) => {
        chai.request(server)
            .post('/sync/customers/stop')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(202);
                done();
            });
    });

    it('should fail to stop sync and return 500', (done) => {
        breeStopMock.mockImplementationOnce(() => { throw Error() })
        chai.request(server)
            .post('/sync/customers/stop')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(500);
                done();
            });
    });
});
