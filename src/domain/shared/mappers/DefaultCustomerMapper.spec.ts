import { DefaultCustomerMapper } from './DefaultCustomerMapper';
import { sampleCustomerApiResponse } from '../../../test/testData/ctCustomerApi'

const customerMapper = new DefaultCustomerMapper();
describe('map CT customer to Klaviyo profile', () => {
    it('should map a commercetools customer to a klaviyo profile', () => {
        const klaviyoEvent = customerMapper.mapCtCustomerToKlaviyoProfile(sampleCustomerApiResponse);
        expect(klaviyoEvent).toMatchSnapshot();
    });
});
