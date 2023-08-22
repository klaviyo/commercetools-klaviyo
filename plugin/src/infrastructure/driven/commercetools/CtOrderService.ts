import { PaginatedOrderResults } from "./DefaultCtOrderService";
import { Order } from '@commercetools/platform-sdk';

export interface CtOrderService {
  getAllOrders (lastId?: string): Promise<PaginatedOrderResults>;
  getOrdersByIdRange (ids: string[], lastId?: string): Promise<PaginatedOrderResults>;
  getOrdersByStartId (startId: string, lastId?: string): Promise<PaginatedOrderResults>;
  getOrderById (orderId: string): Promise<Order | undefined>;
  getOrderByPaymentId (paymentId: string): Promise<Order>;
}
