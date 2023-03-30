import { PaginatedProductResults } from "./DefaultCtProductService";

export interface CtProductService {
  getAllProducts (lastId?: string): Promise<PaginatedProductResults>;
}