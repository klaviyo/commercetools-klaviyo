import { expect } from 'chai';
import {
    ctAuthNock,
    ctDeleteCustomObjectNock,
    ctGetCustomObjectNock,
    ctPostCustomObjectNock,
    getAllCategories,
} from '../nocks/commercetoolsNock';
import { ctGet2Categories } from '../../testData/ctGetCategories';
import { CategoriesSync } from '../../../domain/bulkSync/CategoriesSync';
import { CTCustomObjectLockService } from '../../../domain/bulkSync/services/CTCustomObjectLockService';
import { getApiRoot } from '../../../infrastructure/driven/commercetools/ctService';
import { DefaultCategoryMapper } from '../../../domain/shared/mappers/DefaultCategoryMapper';
import { KlaviyoSdkService } from '../../../infrastructure/driven/klaviyo/KlaviyoSdkService';
import { DefaultCtCategoryService } from '../../../infrastructure/driven/commercetools/DefaultCtCategoryService';
import nock from 'nock';
import { klaviyoCreateCategoryNock } from '../nocks/KlaviyoCategoryNock';

describe('syncAllCategories', () => {
    afterEach(() => {
        nock.cleanAll();
    });
    it('should sync all category events with klaviyo', async () => {
        ctAuthNock(4);
        const nockCtGetCustomObject = ctGetCustomObjectNock(404, 'categoryFullSync', {});
        const nockCtCreateCustomObject = ctPostCustomObjectNock('categoryFullSync');
        const nockCtDeleteCustomObject = ctDeleteCustomObjectNock('categoryFullSync');
        const nockCtGetAllCategories = getAllCategories(ctGet2Categories);
        const nockKlaviyoEvent1 = klaviyoCreateCategoryNock({
            type: 'catalog-category',
            attributes: {
                catalog_type: '$default',
                external_id: '84595235-0e65-4c0c-b44c-9566aeea8017',
                integration_type: '$custom',
                name: 'Frauen',
            },
        });
        const nockKlaviyoEvent2 = klaviyoCreateCategoryNock({
            type: 'catalog-category',
            attributes: {
                catalog_type: '$default',
                external_id: '74c1627f-d004-4278-bc61-29a43fba907d',
                integration_type: '$custom',
                name: 'Neu',
            },
        });

        const categoriesSync = new CategoriesSync(
            new CTCustomObjectLockService(getApiRoot()),
            new DefaultCategoryMapper(),
            new KlaviyoSdkService(),
            new DefaultCtCategoryService(getApiRoot()),
        );
        await categoriesSync.syncAllCategories();

        expect(nockCtGetCustomObject.isDone()).to.be.true;
        expect(nockCtCreateCustomObject.isDone()).to.be.true;
        expect(nockCtDeleteCustomObject.isDone()).to.be.true;
        expect(nockCtGetAllCategories.isDone()).to.be.true;
        expect(nockKlaviyoEvent1.isDone()).to.be.true;
        expect(nockKlaviyoEvent2.isDone()).to.be.true;
        expect(nock.activeMocks().length).to.eq(0);
    });
});
