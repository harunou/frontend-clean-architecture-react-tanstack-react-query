import type { ItemEntity, ItemEntityId, OrderEntityId } from "../types";
import { ordersRepository } from "../repositories";

export const useItemByIdSelector = (
  orderId: OrderEntityId,
  itemId: ItemEntityId,
): ItemEntity | undefined => {
  const { data } = ordersRepository.useGetOrders();

  const order = data.find((orderEntity) => orderEntity.id === orderId);

  if (!order) {
    return;
  }
  return order.itemEntities.find((itemEntity) => itemEntity.id === itemId);
};
