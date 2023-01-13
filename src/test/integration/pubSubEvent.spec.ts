import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);

describe('main', () => {
    it('should work', () => {
        expect(1).to.eq(1);
    });
    // let server: any;
    // beforeAll(() => {
    //     // done();
    //     server = app.listen(0);
    // });
    //
    // afterAll(() => {
    //     server.close();
    // });

    // it('should return status 400 when the request is invalid', (done) => {
    //     chai.request(server)
    //         .post('/')
    //         .send({ invalidData: '123' })
    //         .end((res, err) => {
    //             // res.should.have.status(205);
    //             // expect(res.body).to.deep.equal('starwarsFilmListMock');
    //             expect(err.status).to.eq(400);
    //             done();
    //         });
    // });
    // it('should return status 204 when the request is valid', (done) => {
    //     const data = { resource: { typeId: 'ignored' } };
    //     chai.request(server)
    //         .post('/')
    //         .send({ message: { data: Buffer.from(JSON.stringify(data)) } })
    //         .end((res, err) => {
    //             // res.should.have.status(205);
    //             // expect(res.body).to.deep.equal('starwarsFilmListMock');
    //             expect(err.status).to.eq(204);
    //             done();
    //         });
    // });
});
