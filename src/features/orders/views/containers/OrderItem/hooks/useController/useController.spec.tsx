import { useController } from "./useController";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { PropsWithChildren, FC } from "react";
import { type MockedOrdersGateway, mockUseOrdersGateway } from "../../../../../utils/testing";
import { makeComponentFixture } from "../../../../../utils/testing/makeComponentFixture";
import type { ItemEntityId, OrderEntityId } from "../../../../../types";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  ordersGateway: MockedOrdersGateway;
  orderId: OrderEntityId;
  itemId: ItemEntityId;
}

describe(`${useController.name}`, () => {
  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();

    const { Fixture } = makeComponentFixture();
    context.Fixture = Fixture;
    context.ordersGateway = mockUseOrdersGateway();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it<LocalTestContext>("triggers order item deletion on the gateway", async (context) => {
    context.ordersGateway.deleteItem.mockResolvedValue();
    const { result } = renderHook(
      () => useController({ itemId: context.itemId, orderId: context.orderId }),
      {
        wrapper: context.Fixture,
      },
    );

    result.current.deleteOrderItemButtonClicked();
    await vi.runAllTimersAsync();

    expect(context.ordersGateway.deleteItem).toHaveBeenCalledTimes(1);
  });
});
