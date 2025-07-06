import type { ItemEntityId, OrderEntity, OrderEntityId } from "../../types";
import { ordersRepository } from "../../repositories";

export const useIsLastItemIdSelector = (orderId: OrderEntityId, itemId: ItemEntityId) => {
  const { data } = ordersRepository.useGetOrders();
  return select(data, orderId, itemId);
};

export const select = (
  orderEntities: OrderEntity[],
  orderId: OrderEntityId,
  itemId: ItemEntityId,
): boolean => {
  const order = orderEntities.find((orderEntity) => orderEntity.id === orderId);
  return order?.itemEntities.at(-1)?.id === itemId;
};
