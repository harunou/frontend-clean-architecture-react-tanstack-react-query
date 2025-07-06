import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTotalItemsQuantitySelector } from "./useTotalItemsQuantitySelector";
import { renderHook } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import type { UserEvent } from "@testing-library/user-event";
import type { OrderEntity } from "../../types";
import {
  resetOrderEntitiesFactories,
  mockUseOrdersGateway,
  makeOrderEntities,
  type MockedOrdersGateway,
} from "../../utils/testing";
import { makeComponentFixture } from "../../utils/testing/makeComponentFixture";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  user: UserEvent;
  ordersGateway: MockedOrdersGateway;
  orders: OrderEntity[];
}

describe(`${useTotalItemsQuantitySelector.name}`, () => {
  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();

    resetOrderEntitiesFactories();

    const { Fixture, user } = makeComponentFixture();
    context.Fixture = Fixture;
    context.user = user;
    context.ordersGateway = mockUseOrdersGateway();
    context.orders = makeOrderEntities();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it<LocalTestContext>("returns 0 when there are no orders", async (context) => {
    context.ordersGateway.getOrders.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTotalItemsQuantitySelector(), {
      wrapper: context.Fixture,
    });

    await vi.runAllTimersAsync();

    expect(result.current).toBe(0);
  });

  it<LocalTestContext>("returns 0 when the gateway fails to fetch orders", async (context) => {
    context.ordersGateway.getOrders.mockRejectedValueOnce([]);

    const { result } = renderHook(() => useTotalItemsQuantitySelector(), {
      wrapper: context.Fixture,
    });

    await vi.runAllTimersAsync();

    expect(result.current).toBe(0);
  });

  it<LocalTestContext>("returns total quantity of items in the order ", async (context) => {
    context.ordersGateway.getOrders.mockResolvedValueOnce(context.orders);

    const { result } = renderHook(() => useTotalItemsQuantitySelector(), {
      wrapper: context.Fixture,
    });

    await vi.runAllTimersAsync();

    expect(result.current).toBe(1825);
  });
});
