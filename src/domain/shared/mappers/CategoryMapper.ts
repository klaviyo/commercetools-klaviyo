import { Category } from '@commercetools/platform-sdk';

export interface CategoryMapper {
    mapCtCategoryToKlaviyoCategory(category: Category): CategoryRequest;
}
