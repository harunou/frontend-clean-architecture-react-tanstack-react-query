import { useOrdersPresentationStore } from "../../../stores";
import type { OrdersResource } from "../../../types";

export const useGatewayResource = (forceResource?: OrdersResource) => {
  const ordersResource = useOrdersPresentationStore((state) => state.ordersResource);
  return forceResource ?? ordersResource;
};
