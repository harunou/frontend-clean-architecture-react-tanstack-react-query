import type { OrderEntity, OrderEntityId } from "../../repositories/ordersRepository";
import { ordersRepository } from "../../repositories";

export const useOrderByIdSelector = (orderId: OrderEntityId): OrderEntity | undefined => {
  const { data } = ordersRepository.useGetOrders();

  return data.find((orderEntity) => orderEntity.id === orderId);
};
