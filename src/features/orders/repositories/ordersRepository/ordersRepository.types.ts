import type { Nominal, UniqueEntity } from "../../../../@types";

export type OrderEntityId = Nominal<string, "ORDER_ENTITY_ID">;

export type OrderEntity = UniqueEntity<OrderEntityId> & {
  userId: string;
  itemEntities: ItemEntity[];
};

export type ItemEntityId = Nominal<string, "ITEM_ENTITY_ID">;

export type ItemEntity = UniqueEntity<ItemEntityId> & {
  productId: string;
  quantity: number;
};

export interface OrdersGateway {
  getOrders(): Promise<OrderEntity[]>;
  deleteOrder(orderId: OrderEntityId): Promise<void>;
  deleteItem(orderId: OrderEntityId, itemId: ItemEntityId): Promise<void>;
}
