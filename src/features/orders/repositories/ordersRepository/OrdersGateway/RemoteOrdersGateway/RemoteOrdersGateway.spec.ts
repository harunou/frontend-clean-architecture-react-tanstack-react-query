import { describe, it, beforeEach, beforeAll, afterAll, expect, vi } from "vitest";
import { RemoteOrdersGateway } from "./RemoteOrdersGateway";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { makeItemEntityId, makeOrderEntityId } from "../../../../utils";
import type { OrderEntity } from "../../../../types";
import { orderDtoFactory, OrdersApi, ordersApiUrl } from "../../../../externalResources/OrdersApi";

const server = setupServer();

interface LocalTestContext {
  gateway: RemoteOrdersGateway;
}

describe(`${RemoteOrdersGateway.name}`, () => {
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: "error",
    });
  });
  beforeEach<LocalTestContext>((context) => {
    orderDtoFactory.resetCount();
    context.gateway = RemoteOrdersGateway.make();
  });
  afterAll(() => {
    server.close();
  });
  describe("getOrders", () => {
    it<LocalTestContext>("fetches order entities", async (context) => {
      const ordersDto = orderDtoFactory.list({ count: 1 });

      const expected: OrderEntity[] = [
        {
          id: makeOrderEntityId("1"),
          userId: "75",
          itemEntities: [
            { id: makeItemEntityId("1"), productId: "59", quantity: 75 },
            { id: makeItemEntityId("2"), productId: "17", quantity: 50 },
            { id: makeItemEntityId("3"), productId: "93", quantity: 60 },
          ],
        },
      ];

      server.use(
        http.get(ordersApiUrl, () => HttpResponse.json(ordersDto), {
          once: true,
        }),
      );
      const result = await context.gateway.getOrders();
      expect(result).toEqual(expected);
    });
  });

  describe("deleteOrder", () => {
    it<LocalTestContext>("deletes order", async (context) => {
      const orderId = makeOrderEntityId("1");

      server.use(
        http.delete(`${ordersApiUrl}/${orderId}`, () => HttpResponse.json(), {
          once: true,
        }),
      );

      await context.gateway.deleteOrder(orderId);
    });
  });

  describe("deleteItem", () => {
    it<LocalTestContext>("deletes item from order", async () => {
      const api = OrdersApi.make();
      const gateway = new RemoteOrdersGateway(api);

      vi.spyOn(api, "updateOrder");

      const orderDto = orderDtoFactory.item();
      const orderId = makeOrderEntityId(orderDto.id);
      const itemId = makeItemEntityId(orderDto.items[0].id);

      const expectedOrderDto = {
        id: orderDto.id,
        items: orderDto.items.filter((item) => item.id !== itemId),
        userId: orderDto.userId,
      };

      server.use(
        http.get(`${ordersApiUrl}/${orderId}`, () => HttpResponse.json(orderDto), {
          once: true,
        }),
        http.put(`${ordersApiUrl}/${orderId}`, () => HttpResponse.json(), {
          once: true,
        }),
      );

      await gateway.deleteItem(orderId, itemId);

      expect(api.updateOrder).toHaveBeenCalledExactlyOnceWith("1", expectedOrderDto);
    });
  });
});
