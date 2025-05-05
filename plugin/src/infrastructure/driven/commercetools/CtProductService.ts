import { PaginatedProductResults } from "./DefaultCtProductService";
import { InventoryEntry, Product } from '@commercetools/platform-sdk';

export interface CtProductService {
  getAllProducts (lastId?: string): Promise<PaginatedProductResults>;
  getProductsByIdRange (ids: string[], lastId?: string): Promise<PaginatedProductResults>;
  getInventoryEntryById (inventoryEntryId: string): Promise<InventoryEntry>;
  getProductById (inventoryEntryId: string): Promise<Product>;
}