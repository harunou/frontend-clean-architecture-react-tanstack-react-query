import type { ItemEntityId, OrderEntity, OrderEntityId } from "../../../types";

export interface OrdersGateway {
  getOrders(): Promise<OrderEntity[]>;
  deleteOrder(orderId: OrderEntityId): Promise<void>;
  deleteItem(orderId: OrderEntityId, itemId: ItemEntityId): Promise<void>;
}
