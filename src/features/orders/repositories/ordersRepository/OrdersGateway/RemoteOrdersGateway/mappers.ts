import type { OrderDto, OrderItemDto } from "../../../../externalResources";
import type { OrderEntity, ItemEntity } from "../../../../types";
import { makeOrderEntityId, makeItemEntityId } from "../../../../utils";

export function toOrderEntity(dto: OrderDto): OrderEntity {
  return {
    id: makeOrderEntityId(dto.id),
    userId: dto.userId,
    itemEntities: dto.items.map(toItemEntity),
  };
}

export function toItemEntity(dto: OrderItemDto): ItemEntity {
  return {
    id: makeItemEntityId(dto.id),
    productId: dto.productId,
    quantity: dto.quantity,
  };
}
