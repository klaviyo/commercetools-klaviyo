import { getCustomerProfileFromOrder } from './get-customer-profile-from-order';
import { DefaultCustomerMapper } from '../domain/shared/mappers/DefaultCustomerMapper';

jest.mock('../domain/shared/mappers/CustomerMapper', () => {
    return {
        CustomerMapper: jest.fn().mockImplementation(() => {
            return {
                mapCTAddressToKlaviyoLocation: jest.fn((address, includeCountry) => {
                    return includeCountry
                        ? { $country: address.country, $city: address.city }
                        : { $city: address.city };
                }),
            };
        }),
    };
});

describe('getCustomerProfileFromOrder', () => {
    let customerMapper: DefaultCustomerMapper;

    beforeEach(() => {
        customerMapper = new DefaultCustomerMapper();
    });

    it('should map customer email and ID from order', () => {
        const order = {
            customerEmail: 'test@example.com',
            customerId: '123',
        } as any;
        const profile = getCustomerProfileFromOrder(order, customerMapper);
        expect(profile).toEqual({
            type: 'profile',
            attributes: {
                email: 'test@example.com',
                externalId: '123',
            },
        });
    });

    it('should include additional profile properties when requested', () => {
        const order = {
            customerEmail: 'test@example.com',
            customerId: '123',
            billingAddress: {
                city: 'Test City',
                country: 'Test Country',
            },
        } as any;
        const profile = getCustomerProfileFromOrder(order, customerMapper, true);
        expect(profile).toEqual({
            type: 'profile',
            attributes: {
                address1: '',
                address2: '',
                email: 'test@example.com',
                externalId: '123',
                city: 'Test City',
                country: 'Test Country',
                region: undefined,
                zip: undefined,
            },
        });
    });

    it('should not include additional profile properties when not requested', () => {
        const order = {
            customerEmail: 'test@example.com',
            customerId: '123',
            billingAddress: {
                city: 'Test City',
                country: 'Test Country',
            },
        } as any;
        const profile = getCustomerProfileFromOrder(order, customerMapper, false);
        expect(profile).toEqual({
            type: 'profile',
            attributes: {
                email: 'test@example.com',
                externalId: '123',
            },
        });
    });

    it('should handle missing order details gracefully', () => {
        const order = {} as any;
        const profile = getCustomerProfileFromOrder(order, customerMapper, true);
        expect(profile).toEqual({
            type: 'profile',
            attributes: {},
        });
    });
});
