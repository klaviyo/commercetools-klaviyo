import { Category } from '@commercetools/platform-sdk';
import { CategoryMapper } from './CategoryMapper';
import { getLocalizedStringAsText } from '../../../utils/locale-currency-utils';

export class DefaultCategoryMapper implements CategoryMapper {
    public mapCtCategoryToKlaviyoCategory(category: Category, klaviyoCategoryId?: string): CategoryRequest {
        return {
            data: {
                type: 'catalog-category',
                id: klaviyoCategoryId,
                attributes: {
                    external_id: !klaviyoCategoryId ? category.id : undefined,
                    name: this.getCategoryNameWithAncestors(category),
                    integration_type: !klaviyoCategoryId ? '$custom' : undefined,
                    catalog_type: !klaviyoCategoryId ? '$default' : undefined,
                },
            },
        };
    }

    private getCategoryNameWithAncestors(category: Category): string {
        const categoryNames = category.ancestors
            .map((ancestor) => getLocalizedStringAsText((ancestor.obj as Category).name))
            .concat(getLocalizedStringAsText(category.name));
        return categoryNames.join(' > ');
    }

    public mapKlaviyoCategoryIdToDeleteCategoryRequest(klaviyoCategoryId: string): CategoryDeletedRequest {
        return {
            data: {
                id: klaviyoCategoryId,
            },
        };
    }
}
