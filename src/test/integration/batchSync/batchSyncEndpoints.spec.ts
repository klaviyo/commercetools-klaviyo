import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import http from "http";
import { bulkSyncApp } from "../../../infrastructure/driving/adapter/batchSync/bulkSyncApiAdapter";

chai.use(chaiHttp);

describe('batchSyncApp order sync endpoint', () => {
  let server: http.Server;
  beforeEach(() => {
    server = bulkSyncApp.listen(0);
  });

  afterEach(async () => {
    await server.close();
  });

  it('should accept the request and return 202',  (done) => {
    chai.request(server)
      .post('/sync/orders')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.eq(202);
        done();
      });
  });
});


