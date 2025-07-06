import { describe, it, expect, beforeEach } from "vitest";
import type { OrderEntity } from "../../types";
import { makeOrderEntities, resetOrderEntitiesFactories } from "../../utils/testing";
import { makeItemEntityId, makeOrderEntityId } from "../../utils";
import { select } from "./useIsLastItemIdSelector";

interface LocalTestContext {
  orders: OrderEntity[];
}

describe(`${select.name}`, () => {
  beforeEach<LocalTestContext>((context) => {
    resetOrderEntitiesFactories();
    context.orders = makeOrderEntities();
  });
  it<LocalTestContext>("returns true when itemId matches the last item in the order", (context) => {
    const orderId = context.orders.at(0)!.id;
    const itemId = context.orders.at(0)!.itemEntities.at(-1)!.id;
    expect(select(context.orders, orderId, itemId)).toBe(true);
  });

  it<LocalTestContext>("returns false when itemId is not the last item in the order", (context) => {
    const orderId = context.orders.at(0)!.id;
    const itemId = context.orders.at(0)!.itemEntities.at(-2)!.id;
    expect(select(context.orders, orderId, itemId)).toBe(false);
  });

  it<LocalTestContext>("returns false when the order with the given orderId doesn't exist", (context) => {
    const orderId = makeOrderEntityId("9000");
    const itemId = context.orders.at(0)!.itemEntities.at(-1)!.id;
    expect(select(context.orders, orderId, itemId)).toBe(false);
  });

  it<LocalTestContext>("returns false when the order exists but has no items", (context) => {
    const orderId = context.orders.at(1)!.id;
    const itemId = makeItemEntityId("9000");
    expect(select(context.orders, orderId, itemId)).toBe(false);
  });

  it<LocalTestContext>("returns false when an empty array of order entities is provided", () => {
    const orderId = makeOrderEntityId("9000");
    const itemId = makeItemEntityId("9000");
    expect(select([], orderId, itemId)).toBe(false);
  });
});
