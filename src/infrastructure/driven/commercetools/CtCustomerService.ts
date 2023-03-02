import { PaginatedCustomerResults } from "./DefaultCtCustomerService";

export interface CtCustomerService {
  getAllCustomers (lastId?: string): Promise<PaginatedCustomerResults>;
}
