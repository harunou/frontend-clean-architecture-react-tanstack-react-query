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
