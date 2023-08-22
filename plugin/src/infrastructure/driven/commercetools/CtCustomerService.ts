import { PaginatedCustomerResults } from "./DefaultCtCustomerService";
import { Customer } from '@commercetools/platform-sdk';

export interface CtCustomerService {
  getAllCustomers (lastId?: string): Promise<PaginatedCustomerResults>;
  getCustomersByIdRange (customerIds: string[], lastId?: string): Promise<PaginatedCustomerResults>;
  getCustomerProfile (customerId: string): Promise<Customer>;
}
