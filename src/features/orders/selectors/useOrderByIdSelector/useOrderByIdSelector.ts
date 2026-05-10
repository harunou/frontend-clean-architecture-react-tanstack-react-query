import { ordersRepository, type OrderEntity, type OrderEntityId } from "../../repositories";

export const useOrderByIdSelector = (orderId: OrderEntityId): OrderEntity | undefined => {
  const { data } = ordersRepository.useGetOrders();

  return data.find((orderEntity) => orderEntity.id === orderId);
};
