import { ordersRepository, type OrderEntityId } from "../repositories";

export const useIsLastOrderIdSelector = (orderId: OrderEntityId): boolean => {
  const { data } = ordersRepository.useGetOrders();

  return data.at(-1)?.id === orderId;
};
