import type { Presenter } from "../OrderItem.types";
import type { ItemEntityId, OrderEntityId } from "../../../../types";
import { useIsLastItemIdSelector, useItemByIdSelector } from "../../../../selectors";

export const usePresenter = (params: {
  orderId: OrderEntityId;
  itemId: ItemEntityId;
}): Presenter => {
  const item = useItemByIdSelector(params.orderId, params.itemId);
  const isLastItem = useIsLastItemIdSelector(params.orderId, params.itemId);

  if (!item) {
    return {
      hasItem: false,
    };
  }
  return {
    hasItem: true,
    itemId: item.id,
    productId: item.productId,
    productQuantity: item.quantity,
    isLastItem,
  };
};
