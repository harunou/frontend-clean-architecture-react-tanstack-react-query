import type { OrdersResource } from "../../../types";
import { InMemoryOrdersGateway } from "../OrdersGateway/InMemoryOrdersGateway";
import { makeOrderEntities } from "../OrdersGateway/makeOrderEntities";
import type { OrdersGateway } from "../OrdersGateway/OrdersGateway.types";
import { RemoteOrdersGateway } from "../OrdersGateway/RemoteOrdersGateway";

export const useOrdersGateway = (resource: OrdersResource): OrdersGateway => {
  return resource === "local"
    ? InMemoryOrdersGateway.make(makeOrderEntities())
    : RemoteOrdersGateway.make();
};
