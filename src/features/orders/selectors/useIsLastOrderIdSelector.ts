import type { OrderEntityId } from "../types";
import { ordersRepository } from "../repositories";

export const useIsLastOrderIdSelector = (orderId: OrderEntityId): boolean => {
  const { data } = ordersRepository.useGetOrders();

  return data.at(-1)?.id === orderId;
};
