import { Category } from '@commercetools/platform-sdk';
import { CategoryMapper } from './CategoryMapper';
import { getLocalizedStringAsText } from '../../../utils/locale-currency-utils';
import { CategoryDeletedRequest, CategoryRequest } from '../../../types/klaviyo-types';

export class DefaultCategoryMapper implements CategoryMapper {
    public mapCtCategoryToKlaviyoCategory(category: Category, klaviyoCategoryId?: string): CategoryRequest {
        return {
            data: {
                type: 'catalog-category',
                id: klaviyoCategoryId,
                attributes: {
                    externalId: !klaviyoCategoryId ? category.id : undefined,
                    name: this.getCategoryNameWithAncestors(category),
                    integrationType: !klaviyoCategoryId ? '$custom' : undefined,
                    catalogType: !klaviyoCategoryId ? '$default' : undefined,
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
