import { DefaultCategoryMapper } from './DefaultCategoryMapper';
import { sampleCategoryCreatedMessage } from '../../../test/testData/ctCategoryMessages';

const categoryMapper = new DefaultCategoryMapper();

describe('map CT category to Klaviyo category', () => {
    it('should map a commercetools category to a klaviyo category', () => {
        const klaviyoEvent = categoryMapper.mapCtCategoryToKlaviyoCategory(sampleCategoryCreatedMessage.category);
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should extend the klaviyo category name if the category is a subcategory (has ancestors)', () => {
        const klaviyoEvent = categoryMapper.mapCtCategoryToKlaviyoCategory({
            ...sampleCategoryCreatedMessage.category,
            ancestors: [{
                typeId: 'category',
                id: '123456',
                obj: {
                    name: {
                        'en-US': 'Test main category',
                    },
                } as any,
            }, 
            {
                typeId: 'category',
                id: '123456',
                obj: {
                    name: {
                        'en-US': 'Test subcategory',
                    },
                } as any,
            }],
        });
        expect(klaviyoEvent).toMatchSnapshot();
    });

    it('should map a commercetools category to a klaviyo category with an existing category id', () => {
        const klaviyoEvent = categoryMapper.mapCtCategoryToKlaviyoCategory(
            sampleCategoryCreatedMessage.category,
            '123456',
        );
        expect(klaviyoEvent).toMatchSnapshot();
    });
});

describe('map Klaviyo category to Klaviyo delete category request', () => {
    it('should map a klaviyo category id to a klaviyo delete category', () => {
        const klaviyoEvent = categoryMapper.mapKlaviyoCategoryIdToDeleteCategoryRequest(sampleCategoryCreatedMessage.category.id);
        expect(klaviyoEvent).toMatchSnapshot();
    });
});
