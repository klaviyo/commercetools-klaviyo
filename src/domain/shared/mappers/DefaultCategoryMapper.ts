import { Category } from '@commercetools/platform-sdk';
import { CategoryMapper } from './CategoryMapper';

export class DefaultCategoryMapper implements CategoryMapper {
    public mapCtCategoryToKlaviyoCategory(category: Category, klaviyoCategoryId?: string): CategoryRequest {
        return {
            data: {
                type: 'catalog-category',
                id: klaviyoCategoryId,
                attributes: {
                    external_id: !klaviyoCategoryId ? category.id : undefined,
                    name: category.name[Object.keys(category.name)[0]],
                    integration_type: !klaviyoCategoryId ? '$custom': undefined,
                    catalog_type: !klaviyoCategoryId ? '$default' : undefined,
                },
            },
        };
    }
}
