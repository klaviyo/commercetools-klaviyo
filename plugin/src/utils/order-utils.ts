import { Order } from "@commercetools/platform-sdk";
import config from "config";

export const isOrderFulfilled = (order: Order): boolean => {
  const ctStatesForFulfilled: string[] = config.get('order.states.changed.fulfilledOrder') ?? [];
  return ctStatesForFulfilled.includes(order.orderState)
}
export const isOrderCancelled = (order: Order): boolean => {
  const ctStatesForFulfilled: string[] = config.get('order.states.changed.cancelledOrder') ?? [];
  return ctStatesForFulfilled.includes(order.orderState)
}
