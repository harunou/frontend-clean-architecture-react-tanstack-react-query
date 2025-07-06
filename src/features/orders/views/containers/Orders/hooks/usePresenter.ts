import type { Presenter } from "../Orders.types";
import {
  useIsOrdersProcessingSelector,
  useOrderIdsSelector,
  useTotalItemsQuantitySelector,
} from "../../../../selectors";

export const usePresenter = (): Presenter => {
  const isLoading = useIsOrdersProcessingSelector();
  const orderIds = useOrderIdsSelector();
  const totalItemsQuantity = useTotalItemsQuantitySelector();

  return {
    isLoading: isLoading,
    orderIds,
    totalItemsQuantity,
  };
};
