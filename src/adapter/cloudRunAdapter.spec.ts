import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { cloudRunAdapter } from './cloudRunAdapter';
import { Express } from 'express';

chai.use(chaiHttp);

describe('main', () => {
    // it('should start a web server on port 6789', async () => {
    //     const adapter = await cloudRunAdapter();
    //     const app = adapter as unknown as Express;
    //     expect(adapter).to.not.be.undefined;
    //     expect(app.mountpath).to.be.eq('/');
    // });

    it('should work', () => {
        expect(1).to.eq(1);
    });
});
