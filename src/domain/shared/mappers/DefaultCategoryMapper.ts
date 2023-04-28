import { Category, LocalizedString } from '@commercetools/platform-sdk';
import { CategoryMapper } from './CategoryMapper';

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
            .map((ancestor) => this.getCategoryNameFromLocalizedString((ancestor.obj as Category).name))
            .concat(this.getCategoryNameFromLocalizedString(category.name));
        return categoryNames.join(' > ');
    }

    // Additional method for custom logic to handle locales when needed.
    private getCategoryNameFromLocalizedString(categoryName: LocalizedString): string {
        return categoryName[Object.keys(categoryName)[0]];
    }

    public mapKlaviyoCategoryIdToDeleteCategoryRequest(klaviyoCategoryId: string): CategoryDeletedRequest {
        return {
            data: {
                id: klaviyoCategoryId,
            },
        };
    }
}
