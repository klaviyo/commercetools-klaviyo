import { Category } from '@commercetools/platform-sdk'

export interface CtCategoryService {
  getCategoryById (lastId?: string): Promise<Category>;
}
