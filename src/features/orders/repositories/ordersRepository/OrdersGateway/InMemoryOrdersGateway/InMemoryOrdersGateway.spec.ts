import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryOrdersGateway } from "./InMemoryOrdersGateway";
import type { OrderEntity } from "../../../../types";
import {
  itemEntityFactory,
  makeOrderEntities,
  orderEntityFactory,
} from "../../../../utils/testing";
import { makeOrderEntityId } from "../../../../utils";
import { mockSleep } from "../../../../../../utils/testing/mockSleep";

interface LocalTestContext {
  orders: OrderEntity[];
  localOrdersGateway: InMemoryOrdersGateway;
}

describe(`${InMemoryOrdersGateway.name}`, () => {
  beforeEach<LocalTestContext>((context) => {
    mockSleep();
    orderEntityFactory.resetCount();
    itemEntityFactory.resetCount();
    const orders = makeOrderEntities();
    context.orders = orders;
    context.localOrdersGateway = new InMemoryOrdersGateway(orders);
  });

  describe("fetchOrders", () => {
    it<LocalTestContext>("returns the list of orders", async (context) => {
      const result = await context.localOrdersGateway.getOrders();

      expect(result).toEqual(context.orders);
    });

    it("returns an empty array if no orders are available", async () => {
      const localOrdersGateway = new InMemoryOrdersGateway([]);

      const fetchOrdersPromise = await localOrdersGateway.getOrders();

      expect(fetchOrdersPromise).toEqual([]);
    });
  });

  describe("deleteOrder", () => {
    it<LocalTestContext>("deletes the order", async (context) => {
      const order_3 = context.orders.at(3)!;

      await context.localOrdersGateway.deleteOrder(order_3.id);

      const result = await context.localOrdersGateway.getOrders();

      expect(result).not.toContain(order_3);
    });
  });

  describe("deleteItem", () => {
    it<LocalTestContext>("deletes the item", async (context) => {
      const order_1 = context.orders.at(1)!;
      const item_1_3 = context.orders.at(1)!.itemEntities.at(3)!;

      await context.localOrdersGateway.deleteItem(order_1.id, item_1_3.id);

      const result = await context.localOrdersGateway.getOrders();

      expect(result).toContainEqual({
        ...order_1,
        itemEntities: expect.not.arrayContaining([item_1_3]),
      });
    });
    it<LocalTestContext>("throws an error if the order does not exist", async (context) => {
      const nonExistingOrderId = makeOrderEntityId("9999");
      const item_1_1 = context.orders.at(1)!.itemEntities.at(2)!;

      const result = context.localOrdersGateway.deleteItem(nonExistingOrderId, item_1_1.id);

      await expect(result).rejects.toThrowError();
    });
  });

  describe("setOrders", () => {
    it<LocalTestContext>("adds new orders to the existing ones", async (context) => {
      const gateway = new InMemoryOrdersGateway([]);

      gateway.setOrders(context.orders);

      const result = await gateway.getOrders();

      expect(result).toEqual(context.orders);
    });
  });
});
