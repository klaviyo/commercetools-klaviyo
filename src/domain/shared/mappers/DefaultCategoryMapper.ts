import { Category } from '@commercetools/platform-sdk';
import { CategoryMapper } from './CategoryMapper';

export class DefaultCategoryMapper implements CategoryMapper {
    public mapCtCategoryToKlaviyoCategory(category: Category): CategoryRequest {
        return {
            data: {
                type: 'catalog-category',
                attributes: {
                    external_id: category.id,
                    name: category.name[Object.keys(category.name)[0]],
                    integration_type: '$custom',
                    catalog_type: '$default',
                },
            },
        };
    }
}
