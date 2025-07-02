import { sleep } from "../../../../../utils";
import type { OrdersGateway, OrderEntity, OrderEntityId } from "../../../types";

export class LocalOrdersGateway implements OrdersGateway {
  static instance: LocalOrdersGateway | null = null;
  static make(orders: OrderEntity[] = []): LocalOrdersGateway {
    if (LocalOrdersGateway.instance === null) {
      LocalOrdersGateway.instance = new LocalOrdersGateway(orders);
    }

    return LocalOrdersGateway.instance;
  }

  private orders = new Map<OrderEntityId, OrderEntity>();

  constructor(orders: OrderEntity[]) {
    this.setOrders(orders);
  }

  setOrders(orders: OrderEntity[]): void {
    orders.forEach((order) => this.orders.set(order.id, order));
  }

  async getOrders(): Promise<OrderEntity[]> {
    await sleep(500);

    return Array.from(this.orders.values());
  }

  async deleteOrder(orderId: OrderEntityId): Promise<void> {
    await sleep(300);

    if (!this.orders.has(orderId)) {
      throw new Error(`Order with id ${orderId} not found`);
    }
    this.orders.delete(orderId);
  }

  async deleteItem(orderId: OrderEntityId, itemId: string): Promise<void> {
    await sleep(700);

    const order = this.orders.get(orderId);

    if (!order) {
      throw new Error(`Order with id ${orderId} not found`);
    }

    order.itemEntities = order.itemEntities.filter((item) => item.id !== itemId);
  }
}
