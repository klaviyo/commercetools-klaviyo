import { Category } from '@commercetools/platform-sdk';
import { PaginatedCategoryResults } from './DefaultCtCategoryService';

export interface CtCategoryService {
    getAllCategories(lastId?: string): Promise<PaginatedCategoryResults>;
    getCategoryById(lastId?: string): Promise<Category>;
}
