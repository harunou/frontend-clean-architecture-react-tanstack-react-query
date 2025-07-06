import { useOrdersPresentationStore } from "../stores";
import type { OrdersResource } from "../types";

export const useOrdersResourceSelector = (): OrdersResource => {
  return useOrdersPresentationStore((state) => state.ordersResource);
};
