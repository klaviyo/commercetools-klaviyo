import { DefaultCustomerMapper } from './DefaultCustomerMapper';
import { sampleCustomerApiResponse } from '../../../test/testData/ctCustomerApi'
import { expect as exp } from 'chai';

const customerMapper = new DefaultCustomerMapper();
describe('map CT customer to Klaviyo profile', () => {
    it('should map a commercetools customer to a klaviyo profile', () => {
        const klaviyoEvent = customerMapper.mapCtCustomerToKlaviyoProfile(sampleCustomerApiResponse);
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should include/exclude/map custom fields and send them with the klaviyo profile', () => {
        const klaviyoEvent = customerMapper.mapCtCustomerToKlaviyoProfile({
            ...sampleCustomerApiResponse,
            custom: {
                type: {
                    typeId: 'type',
                    id: '123456',
                },
                fields: {
                    includedField: true,
                    ignoredField: 'test-ignored-field',
                },
            }
        });
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools customer to a klaviyo profile with an existing profile id', () => {
        const klaviyoEvent = customerMapper.mapCtCustomerToKlaviyoProfile(sampleCustomerApiResponse, '123456');
        expect(klaviyoEvent).toMatchSnapshot();
    });
});

describe('validate phone number', () => {
    it('should return null when the phone number is an empty string', () => {
        const result = customerMapper.getPhoneNumber({ country: 'aCountry', mobile: '' });
        exp(result).to.be.null;
    });
    it.each`
        phoneNumber
        ${'+12/345(678)*900'}
        ${'+12()*- 345678900'}
        ${'abcde()*()+12 345 678 900'}
        ${'+1-2-3-4-5-6-7-8-9-0-0'}
    `('should return the phone number when it is valid and remove symbols and spaces', ({ phoneNumber }) => {
        const result = customerMapper.getPhoneNumber({ country: 'aCountry', mobile: phoneNumber });
        exp(result).to.be.eq('+12345678900');
    });
    it('should return null when the phone number is invalid', () => {
        const result = customerMapper.getPhoneNumber({ country: 'aCountry', mobile: '31 102455400' });
        exp(result).to.be.null;
    });
    it('should return the mobile number when both phone and mobile are present in the address', () => {
        const result = customerMapper.getPhoneNumber({ country: 'aCountry', mobile: '+31 102455400', phone: '+31 102455401' });
        exp(result).to.be.eq('+31102455400');
    });
    it('should return the phone number when the mobile number is missing in the address', () => {
        const result = customerMapper.getPhoneNumber({ country: 'aCountry', phone: '+31 102455401' });
        exp(result).to.be.eq('+31102455401');
    });
});
