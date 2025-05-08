import { Category } from '@commercetools/platform-sdk';
import { CategoryDeletedRequest, CategoryRequest } from '../../../types/klaviyo-types';

export interface CategoryMapper {
    mapCtCategoryToKlaviyoCategory(category: Category, klaviyoCategoryId?: string): CategoryRequest;
    mapKlaviyoCategoryIdToDeleteCategoryRequest(klaviyoCategoryId: string): CategoryDeletedRequest;
}
