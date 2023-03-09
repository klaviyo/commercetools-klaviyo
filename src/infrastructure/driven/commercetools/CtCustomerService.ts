import { PaginatedCustomerResults } from "./DefaultCtCustomerService";

export interface CtCustomerService {
  getAllCustomers (lastId?: string): Promise<PaginatedCustomerResults>;
  getCustomersByIdRange (customerIds: string[], lastId?: string): Promise<PaginatedCustomerResults>;
}
