import chai, { expect as exp } from 'chai';
import chaiHttp from 'chai-http';
import http from 'http';
const breeMock = {
    run: jest.fn(),
    stop: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    config: {} as any,
};
import { bulkSyncApp } from '../../../infrastructure/driving/adapter/bulkSync/bulkSyncApiAdapter';
import logger from '../../../utils/log';

jest.mock('bree', () => {
    return {
        __esModule: true,
        default: function (config: any) {
            breeMock.config = config;
            return breeMock;
        },
    };
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
                exp(err).to.be.null;
                exp(res.status).to.eq(202);
                done();
            });
    });

    it('should accept the start sync request by id range and return 202', (done) => {
        const breeAddSpy = jest.spyOn(breeMock, 'add');
        chai.request(server)
            .post('/sync/orders')
            .send({
                ids: ['123456', '456789'],
            })
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(202);
                expect(breeAddSpy).toHaveBeenCalledWith([
                    {
                        name: 'ordersSync',
                        worker: {
                            workerData: {
                                orderIds: ['123456', '456789'],
                            },
                        },
                    },
                ]);
                done();
            });
    });

    it('should fail to start sync and return 500', (done) => {
        breeMock.run.mockImplementationOnce(() => {
            throw Error();
        });
        chai.request(server)
            .post('/sync/orders')
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(500);
                done();
            });
    });

    it('should accept the stop sync request and return 202', (done) => {
        chai.request(server)
            .post('/sync/orders/stop')
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(202);
                done();
            });
    });

    it("should fail to stop sync if it's not running and return 400", (done) => {
        breeMock.remove.mockImplementationOnce(() => {
            throw Error('Job "test" does not exist');
        });
        const loggerSpy = jest.spyOn(logger, 'warn');
        chai.request(server)
            .post('/sync/orders/stop')
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(400);
                exp(res.body?.message).to.eq('Orders sync is not currently running.');
                expect(loggerSpy).toHaveBeenCalledWith(
                    "Tried to stop orders sync, but it isn't currently in progress.",
                );
                done();
            });
    });

    it('should fail to stop sync and return 500', (done) => {
        breeMock.remove.mockImplementationOnce(() => {
            throw Error();
        });
        chai.request(server)
            .post('/sync/orders/stop')
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(500);
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
                exp(err).to.be.null;
                exp(res.status).to.eq(202);
                done();
            });
    });

    it('should accept the start sync request by id range and return 202', (done) => {
        const breeAddSpy = jest.spyOn(breeMock, 'add');
        chai.request(server)
            .post('/sync/customers')
            .send({
                ids: ['123456', '456789'],
            })
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(202);
                expect(breeAddSpy).toHaveBeenCalledWith([
                    {
                        name: 'customersSync',
                        worker: {
                            workerData: {
                                customerIds: ['123456', '456789'],
                            },
                        },
                    },
                ]);
                done();
            });
    });

    it('should fail to start sync and return 500', (done) => {
        breeMock.run.mockImplementationOnce(() => {
            throw Error();
        });
        chai.request(server)
            .post('/sync/customers')
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(500);
                done();
            });
    });

    it('should accept the stop sync request and return 202', (done) => {
        chai.request(server)
            .post('/sync/customers/stop')
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(202);
                done();
            });
    });

    it("should fail to stop sync if it's not running and return 400", (done) => {
        breeMock.remove.mockImplementationOnce(() => {
            throw Error('Job "test" does not exist');
        });
        const loggerSpy = jest.spyOn(logger, 'warn');
        chai.request(server)
            .post('/sync/customers/stop')
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(400);
                exp(res.body?.message).to.eq('Customers sync is not currently running.');
                expect(loggerSpy).toHaveBeenCalledWith(
                    "Tried to stop customers sync, but it isn't currently in progress.",
                );
                done();
            });
    });

    it('should fail to stop sync and return 500', (done) => {
        breeMock.remove.mockImplementationOnce(() => {
            throw Error();
        });
        chai.request(server)
            .post('/sync/customers/stop')
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(500);
                done();
            });
    });
});

describe('bulkSyncApp status check endpoint', () => {
    let server: http.Server;
    beforeEach(() => {
        server = bulkSyncApp.listen(0);
    });

    afterEach(async () => {
        await server.close();
    });

    it('should accept the log status request and return 202', (done) => {
        const breeRunSpy = jest.spyOn(breeMock, 'run').mockImplementationOnce(() => breeMock.config.jobs[0].path());
        chai.request(server)
            .get('/sync/status')
            .end((err, res) => {
                exp(err).to.be.null;
                exp(res.status).to.eq(202);
                expect(breeRunSpy).toHaveBeenCalledTimes(1);
                done();
            });
    });
});

describe('bulkSyncApp workerMessageHandler', () => {
    let server: http.Server;
    beforeEach(() => {
        server = bulkSyncApp.listen(0);
    });

    afterEach(async () => {
        await server.close();
    });

    it('should call bree remove when a "done" message is received from a worker', () => {
        const breeRemoveSpy = jest.spyOn(breeMock, 'remove');
        breeMock.config.workerMessageHandler({ name: 'test', message: 'done' });
        expect(breeRemoveSpy).toHaveBeenCalledWith('test');
    });
});
