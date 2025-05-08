import { expect } from 'chai';
import {
    ctAuthNock,
    ctDeleteCustomObjectNock,
    ctGetCustomObjectNock,
    ctPostCustomObjectNock,
    getAllCustomers,
} from '../nocks/commercetoolsNock';
import { klaviyoCreateProfileNock } from '../nocks/KlaviyoProfileNock';
import { ctGet2Customers } from '../../testData/ctGetCustomers';
import { CustomersSync } from '../../../domain/bulkSync/CustomersSync';
import { CTCustomObjectLockService } from '../../../domain/bulkSync/services/CTCustomObjectLockService';
import { getApiRoot } from '../../../infrastructure/driven/commercetools/ctService';
import { DefaultCustomerMapper } from '../../../domain/shared/mappers/DefaultCustomerMapper';
import { KlaviyoSdkService } from '../../../infrastructure/driven/klaviyo/KlaviyoSdkService';
import { DefaultCtCustomerService } from '../../../infrastructure/driven/commercetools/DefaultCtCustomerService';
import nock from 'nock';

describe('syncAllCustomers', () => {
    afterEach(() => {
        nock.cleanAll();
    });
    it('should sync all customer profiles with klaviyo', async () => {
        ctAuthNock(4);
        const nockCtGetCustomObject = ctGetCustomObjectNock(404, 'customerFullSync', {});
        const nockCtCreateCustomObject = ctPostCustomObjectNock('customerFullSync');
        const nockCtDeleteCustomObject = ctDeleteCustomObjectNock('customerFullSync');
        const nockCtGetAllCustomers = getAllCustomers(ctGet2Customers);
        const nockKlaviyoCreateProfile1 = klaviyoCreateProfileNock({
            type: 'profile',
            attributes: {
                email: 'Maximilian.Volkman@hotmail.com',
                external_id: '33c11557-af1c-4104-a1fb-8de2434ded66',
                first_name: 'Kaylee',
                last_name: 'Bayer',
                location: { address1: '12, First Street', address2: '', city: 'Raleigh', country: 'NL', zip: '12345' },
                phone_number: '+39 3234567892',
                title: 'Miss',
            },
        });
        const nockKlaviyoCreateProfile2 = klaviyoCreateProfileNock({
            type: 'profile',
            attributes: {
                email: 'Brisa_Schowalter@yahoo.com',
                external_id: '813546ce-40b3-440b-8c04-489bc530d162',
                first_name: 'Yvette',
                last_name: 'Collins',
                location: {
                    address1: '12, First Street',
                    address2: '',
                    city: 'East Bertrandmouth',
                    country: 'NL',
                    zip: '12345',
                },
                phone_number: '+39 3234567892',
                title: 'Miss',
            },
        });

        const customersSync = new CustomersSync(
            new CTCustomObjectLockService(getApiRoot()),
            new DefaultCustomerMapper(),
            new KlaviyoSdkService(),
            new DefaultCtCustomerService(getApiRoot()),
        );
        await customersSync.syncAllCustomers();

        expect(nockCtGetCustomObject.isDone()).to.be.true;
        expect(nockCtCreateCustomObject.isDone()).to.be.true;
        expect(nockCtDeleteCustomObject.isDone()).to.be.true;
        expect(nockCtGetAllCustomers.isDone()).to.be.true;
        expect(nockKlaviyoCreateProfile1.isDone()).to.be.true;
        expect(nockKlaviyoCreateProfile2.isDone()).to.be.true;
        expect(nock.activeMocks().length).to.eq(0);
    }, 10000);
});
