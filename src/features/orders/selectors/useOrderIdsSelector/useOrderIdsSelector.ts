import type { OrderEntityId } from "../../repositories/ordersRepository";
import { ordersRepository } from "../../repositories";

export const useOrderIdsSelector = (): OrderEntityId[] => {
  const { data } = ordersRepository.useGetOrders();

  return data.map((order) => order.id);
};
