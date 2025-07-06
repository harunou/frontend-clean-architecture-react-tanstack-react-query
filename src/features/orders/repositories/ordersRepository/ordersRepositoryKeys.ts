import type { OrdersResource } from "../../types";

const ORDERS_NAMESPACE = ["orders"] as const;

const makeGetOrdersKey = (resource: OrdersResource) => [...ORDERS_NAMESPACE, resource] as const;

const makeDeleteOrderItemKey = (resource: OrdersResource) =>
  [...ORDERS_NAMESPACE, resource, "order", "item", "delete"] as const;

const makeDeleteOrderKey = (resource: OrdersResource) =>
  [...ORDERS_NAMESPACE, resource, "order", "delete"] as const;

export const ordersRepositoryKeys = {
  ORDERS_NAMESPACE,
  makeGetOrdersKey,
  makeDeleteOrderKey,
  makeDeleteOrderItemKey,
};
