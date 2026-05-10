import type { OrderEntityId, ItemEntityId, OrderEntity } from "./ordersRepository.types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useIsMutating,
  useMutationState,
} from "@tanstack/react-query";
import { ordersRepositoryKeys } from "./ordersRepositoryKeys";
import { isOrderItemMutationVariables } from "./ordersRepository.utils";
import { OrdersService } from "./OrdersService";
import type { OrdersResource } from "../../types";
import { useGatewayResource } from "./hooks";

const DEFAULT_ORDERS: OrderEntity[] = [];

const useGetOrders = (forceResource: OrdersResource) => {
  const resource = useGatewayResource(forceResource);
  const gateway = OrdersService.make(resource);
  const getOrdersKey = ordersRepositoryKeys.makeGetOrdersKey(resource);

  const { data } = useQuery({
    queryFn: async () => gateway.getOrders(),
    queryKey: getOrdersKey,
    // disable structural sharing, because it cannot detect an update when an
    // item is deleted from an order.
    structuralSharing: false,
  });

  return { data: data ?? DEFAULT_ORDERS };
};

const useGetOrdersQueryState = (forceResource: OrdersResource) => {
  const resource = useGatewayResource(forceResource);
  const gateway = OrdersService.make(resource);
  const getOrdersKey = ordersRepositoryKeys.makeGetOrdersKey(resource);

  return useQuery({
    queryFn: async () => {
      const orders = await gateway.getOrders();
      return orders;
    },
    queryKey: getOrdersKey,
  });
};

const useDeleteOrder = (forceResource: OrdersResource) => {
  const queryClient = useQueryClient();
  const resource = useGatewayResource(forceResource);
  const gateway = OrdersService.make(resource);
  const deleteOrderKey = ordersRepositoryKeys.makeDeleteOrderKey(resource);
  const getOrdersKey = ordersRepositoryKeys.makeGetOrdersKey(resource);

  return useMutation({
    mutationKey: deleteOrderKey,
    mutationFn: async (params: { orderId: OrderEntityId }) => {
      await gateway.deleteOrder(params.orderId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getOrdersKey });
    },
  });
};

const useDeleteOrderItem = (forceResource: OrdersResource) => {
  const queryClient = useQueryClient();
  const resource = useGatewayResource(forceResource);
  const gateway = OrdersService.make(resource);
  const deleteOrderItemKey = ordersRepositoryKeys.makeDeleteOrderItemKey(resource);
  const getOrdersKey = ordersRepositoryKeys.makeGetOrdersKey(resource);

  return useMutation({
    mutationKey: deleteOrderItemKey,
    mutationFn: async (params: { orderId: OrderEntityId; itemId: ItemEntityId }) => {
      await gateway.deleteItem(params.orderId, params.itemId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getOrdersKey });
    },
  });
};

const useIsDeletingOrderItemMutating = () => {
  return !!useIsMutating({
    mutationKey: ordersRepositoryKeys.makeDeleteOrderItemKey(useGatewayResource()),
  });
};

const useIsDeletingOrderMutating = () => {
  return !!useIsMutating({
    mutationKey: ordersRepositoryKeys.makeDeleteOrderKey(useGatewayResource()),
  });
};

const useCancelAllQueries = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.cancelQueries({
      queryKey: ordersRepositoryKeys.ORDERS_NAMESPACE,
    });
};

const useOrderItemMutationState = (orderId: OrderEntityId, itemId: ItemEntityId) => {
  return useMutationState({
    filters: {
      mutationKey: ordersRepositoryKeys.makeDeleteOrderItemKey(useGatewayResource()),
      predicate(mutation) {
        const variables = mutation.state.variables;
        if (!isOrderItemMutationVariables(variables)) {
          return false;
        }

        return variables.orderId === orderId && variables.itemId === itemId;
      },
    },
  });
};

export const ordersRepository = {
  useGetOrders,
  useGetOrdersQueryState,
  useDeleteOrder,
  useDeleteOrderItem,
  useIsDeletingOrderMutating,
  useIsDeletingOrderItemMutating,
  useOrderItemMutationState,
  useCancelAllQueries,
};
