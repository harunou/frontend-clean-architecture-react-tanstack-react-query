import { ordersRepository } from "../../repositories";

export const useIsOrdersProcessingSelector = (): boolean => {
  const { isLoading: isLoadingWhileGetOrders } = ordersRepository.useGetOrdersQueryState();
  const isDeletingOrderItem = ordersRepository.useIsDeletingOrderItemMutating();
  const isDeletingOrder = ordersRepository.useIsDeletingOrderMutating();
  return isLoadingWhileGetOrders || isDeletingOrderItem || isDeletingOrder;
};
