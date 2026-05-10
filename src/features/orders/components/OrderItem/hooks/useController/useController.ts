import { useCallback, useMemo } from "react";
import type { Controller } from "../../OrderItem.types";
import { ordersRepository, type ItemEntityId, type OrderEntityId } from "../../../../repositories";

export const useController = (params: {
  orderId: OrderEntityId;
  itemId: ItemEntityId;
}): Controller => {
  const { mutateAsync: deleteOrderItem } = ordersRepository.useDeleteOrderItem();

  const deleteOrderItemButtonClicked = useCallback(async () => {
    await deleteOrderItem(params);
  }, [deleteOrderItem, params]);

  return useMemo(
    () => ({
      deleteOrderItemButtonClicked,
    }),
    [deleteOrderItemButtonClicked],
  );
};
