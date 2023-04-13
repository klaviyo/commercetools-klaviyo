import { PaginatedOrderResults } from "./DefaultCtOrderService";

export interface CtOrderService {
  getAllOrders (lastId?: string): Promise<PaginatedOrderResults>;
  getOrdersByIdRange (ids: string[], lastId?: string): Promise<PaginatedOrderResults>;
  getOrdersByStartId (startId: string, lastId?: string): Promise<PaginatedOrderResults>;
}
