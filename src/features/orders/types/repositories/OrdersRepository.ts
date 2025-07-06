import type { MutationState, UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { OrderEntity, OrderEntityId, ItemEntityId } from "../entities";
import type { OrdersResource } from "../OrdersResource";

export interface OrdersRepository {
  useGetOrdersQueryState(forceResource?: OrdersResource): UseQueryResult<OrderEntity[], Error>;
  useGetOrders(forceResource?: OrdersResource): { data: OrderEntity[] };
  useDeleteOrder(
    forceResource?: OrdersResource,
  ): UseMutationResult<void, Error, { orderId: OrderEntityId }>;
  useDeleteOrderItem(
    forceResource?: OrdersResource,
  ): UseMutationResult<void, Error, { orderId: OrderEntityId; itemId: ItemEntityId }>;
  useOrderItemMutationState(
    orderId: OrderEntityId,
    itemId: ItemEntityId,
  ): Array<MutationState<void, Error, { orderId: OrderEntityId; itemId: ItemEntityId }>>;
  useIsDeletingOrderMutating(): boolean;
  useIsDeletingOrderItemMutating(): boolean;
  useCancelAllQueries(): () => void;
}
