import { getPhoneNumber } from './CustomerAddressUtils';
import { expect } from 'chai';

describe('validate phone number', () => {
    it('should return null when the phone number is an empty string', () => {
        const result = getPhoneNumber({ country: 'aCountry', mobile: '' });
        expect(result).to.be.null;
    });
    it('should return the phone number when it is valid and remove any spaces', () => {
        const result = getPhoneNumber({ country: 'aCountry', mobile: '+31 102455400' });
        expect(result).to.be.eq('+31102455400');
    });
    it('should return null when the phone number is invalid', () => {
        const result = getPhoneNumber({ country: 'aCountry', mobile: '31 102455400' });
        expect(result).to.be.null;
    });
    it('should return the mobile number when both phone and mobile are present in the address', () => {
        const result = getPhoneNumber({ country: 'aCountry', mobile: '+31 102455400', phone: '+31 102455401' });
        expect(result).to.be.eq('+31102455400');
    });
    it('should return the phone number when the mobile number is missing in the address', () => {
        const result = getPhoneNumber({ country: 'aCountry', phone: '+31 102455401' });
        expect(result).to.be.eq('+31102455401');
    });
});
