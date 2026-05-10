import type { ItemEntityId, OrderEntityId } from "../repositories/ordersRepository";
import { ordersRepository } from "../repositories";

export const useIsItemProcessingSelector = (
  orderId: OrderEntityId,
  itemId: ItemEntityId,
): boolean => {
  const states = ordersRepository.useOrderItemMutationState(orderId, itemId);
  return states.some((s) => s.status === "pending");
};
