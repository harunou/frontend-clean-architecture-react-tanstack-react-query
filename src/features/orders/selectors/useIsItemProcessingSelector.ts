import { ordersRepository, type ItemEntityId, type OrderEntityId } from "../repositories";

export const useIsItemProcessingSelector = (
  orderId: OrderEntityId,
  itemId: ItemEntityId,
): boolean => {
  const states = ordersRepository.useOrderItemMutationState(orderId, itemId);
  return states.some((s) => s.status === "pending");
};
