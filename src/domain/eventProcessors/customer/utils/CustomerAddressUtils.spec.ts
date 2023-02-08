import { getPhoneNumber } from './CustomerAddressUtils';
import { expect } from 'chai';

describe('validate phone number', () => {
    it('should return null when the phone number is an empty string', () => {
        const result = getPhoneNumber({ country: 'aCountry', mobile: '' });
        expect(result).to.be.null;
    });
    it.each`
        phoneNumber
        ${'+12/345(678)*900'}
        ${'+12()*- 345678900'}
        ${'abcde()*()+12 345 678 900'}
        ${'+1-2-3-4-5-6-7-8-9-0-0'}
    `('should return the phone number when it is valid and remove symbols and spaces', ({ phoneNumber }) => {
        const result = getPhoneNumber({ country: 'aCountry', mobile: phoneNumber });
        expect(result).to.be.eq('+12345678900');
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
