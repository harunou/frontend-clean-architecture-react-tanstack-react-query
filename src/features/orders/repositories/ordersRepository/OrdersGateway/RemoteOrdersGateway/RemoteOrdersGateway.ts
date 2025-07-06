import { OrdersApi, type OrderDto } from "../../../../externalResources";
import type { ItemEntityId, OrderEntity, OrderEntityId } from "../../../../types";
import type { OrdersGateway } from "../OrdersGateway.types";
import { toOrderEntity } from "./mappers";

export class RemoteOrdersGateway implements OrdersGateway {
  static make(): RemoteOrdersGateway {
    return new RemoteOrdersGateway(OrdersApi.make());
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
