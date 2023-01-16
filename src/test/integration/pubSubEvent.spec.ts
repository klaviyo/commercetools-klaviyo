import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { app, cloudRunAdapter } from '../../adapter/cloudRunAdapter';
import nock = require('nock');

chai.use(chaiHttp);

describe('main', () => {
    nock.recorder.rec();
    let server: any;
    beforeAll(() => {
        // done();
        // const app = app;
        server = app.listen(0);
    });

    afterAll(() => {
        server.close();
    });

    it('should return status 400 when the request is invalid', (done) => {
        chai.request(server)
            .post('/')
            .send({ invalidData: '123' })
            .end((res, err) => {
                // res.should.have.status(205);
                // expect(res.body).to.deep.equal('starwarsFilmListMock');
                expect(err.status).to.eq(400);
                done();
            });
    });

    it('should return status 400 when the request has no body', (done) => {
        chai.request(server)
            .post('/')
            // .send(undefined)
            .end((res, err) => {
                // res.should.have.status(205);
                // expect(res.body).to.deep.equal('starwarsFilmListMock');
                expect(err.status).to.eq(400);
                done();
            });
    });
    it('should return status 204 when the request is valid', (done) => {
        const data = { resource: { typeId: 'customer' } };
        chai.request(server)
            .post('/')
            .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
            .end((res, err) => {
                // res.should.have.status(205);
                // expect(res.body).to.deep.equal('starwarsFilmListMock');
                expect(err.status).to.eq(204);
                done();
            });
    });
});
