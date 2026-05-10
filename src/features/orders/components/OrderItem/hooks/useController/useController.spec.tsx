import { useController } from "./useController";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { PropsWithChildren, FC } from "react";
import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from "../../../../repositories/ordersRepository/utils/testing";
import { makeComponentFixture } from "../../../../utils/testing/makeComponentFixture";
import type { ItemEntityId, OrderEntityId } from "../../../../repositories/ordersRepository";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  orderId: OrderEntityId;
  itemId: ItemEntityId;
  ordersServiceMock: MockedOrdersService;
}

describe(`${useController.name}`, () => {
  const ordersServiceMock = makeOrdersServiceMock();

  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();

    const { Fixture } = makeComponentFixture();
    context.Fixture = Fixture;
    context.ordersServiceMock = ordersServiceMock.mock;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it<LocalTestContext>("triggers order item deletion on the gateway", async (context) => {
    context.ordersServiceMock.deleteItem.mockResolvedValue();
    const { result } = renderHook(
      () => useController({ itemId: context.itemId, orderId: context.orderId }),
      {
        wrapper: context.Fixture,
      },
    );

    result.current.deleteOrderItemButtonClicked();
    await vi.runAllTimersAsync();

    expect(context.ordersServiceMock.deleteItem).toHaveBeenCalledTimes(1);
  });
});
