import { useMemo } from "react";
import type { Presenter } from "../../Order.types";
import type { ItemEntity, OrderEntityId } from "../../../../../types";
import {
  useOrderByIdSelector,
  useIsLastOrderIdSelector,
  useIsOrdersProcessingSelector,
} from "../../../../../selectors";

const ITEMS_FALLBACK: ItemEntity[] = [];

export const usePresenter = (params: { orderId: OrderEntityId }): Presenter => {
  const order = useOrderByIdSelector(params.orderId);
  const isLastOrderId = useIsLastOrderIdSelector(params.orderId);
  const isProcessingOrders = useIsOrdersProcessingSelector();

  const items = order?.itemEntities ?? ITEMS_FALLBACK;

  return useMemo(() => {
    if (!order) {
      return {
        hasOrder: false,
      };
    }
    return {
      hasOrder: true,
      userId: order.userId,
      orderId: order.id,
      itemIds: items.map((itemEntity) => itemEntity.id),
      isLastOrder: isLastOrderId,
      isDeleteOrderButtonDisabled: isProcessingOrders,
    };
  }, [isLastOrderId, isProcessingOrders, order, items]);
};
