import { useCallback } from "react";
import type { Controller } from "../../OrderItem.types";
import type { ItemEntityId, OrderEntityId } from "../../../../../types";
import { ordersRepository } from "../../../../../repositories";

export const useController = (params: {
  orderId: OrderEntityId;
  itemId: ItemEntityId;
}): Controller => {
  const { mutateAsync: deleteOrderItem } = ordersRepository.useDeleteOrderItem();

  const deleteOrderItemButtonClicked = useCallback(async () => {
    await deleteOrderItem(params);
  }, [deleteOrderItem, params]);

  return {
    deleteOrderItemButtonClicked,
  };
};
