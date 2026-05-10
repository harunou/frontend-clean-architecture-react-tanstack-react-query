import { OrdersApi, type OrderDto } from "../../../../api";
import type {
  ItemEntityId,
  OrderEntity,
  OrderEntityId,
  OrdersGateway,
} from "../../ordersRepository.types";
import { toOrderEntity } from "./mappers";

export class RemoteOrdersService implements OrdersGateway {
  static make(): RemoteOrdersService {
    return new RemoteOrdersService(OrdersApi.make());
  }

  constructor(private api: OrdersApi) {}

  async getOrders(): Promise<OrderEntity[]> {
    const ordersDto = await this.api.getOrders();
    return ordersDto.map(toOrderEntity);
  }

  deleteOrder(orderId: OrderEntityId): Promise<void> {
    return this.api.deleteOrder(orderId);
  }

  async deleteItem(orderId: OrderEntityId, itemId: ItemEntityId): Promise<void> {
    const orderDto = await this.api.getOrder(orderId);
    const updatedOrder: OrderDto = {
      ...orderDto,
      items: orderDto.items.filter((item) => item.id !== itemId),
    };
    await this.api.updateOrder(orderId, updatedOrder);
  }
}
