import { ordersRepository, type OrderEntityId } from "../../repositories";

export const useOrderIdsSelector = (): OrderEntityId[] => {
  const { data } = ordersRepository.useGetOrders();

  return data.map((order) => order.id);
};
