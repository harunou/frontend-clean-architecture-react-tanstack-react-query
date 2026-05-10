import type { OrdersResource } from "../../../types";
import type { OrdersGateway } from "../ordersRepository.types";
import { InMemoryOrdersService } from "./InMemoryOrdersService";
import { RemoteOrdersService } from "./RemoteOrdersService";

export class OrdersService {
  static make(resource: OrdersResource): OrdersGateway {
    return resource === "local" ? InMemoryOrdersService.make() : RemoteOrdersService.make();
  }
}
