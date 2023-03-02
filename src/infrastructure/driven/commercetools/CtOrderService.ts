import { PaginatedOrderResults } from "./DefaultCtOrderService";

export interface CtOrderService {
  getAllOrders (lastId?: string): Promise<PaginatedOrderResults>;
}
