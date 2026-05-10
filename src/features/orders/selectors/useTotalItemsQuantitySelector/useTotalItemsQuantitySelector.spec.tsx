import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTotalItemsQuantitySelector } from "./useTotalItemsQuantitySelector";
import { renderHook } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import type { UserEvent } from "@testing-library/user-event";
import type { OrderEntity } from "../../repositories";
import { resetOrderEntitiesFactories, makeOrderEntities } from "../../utils/testing";
import { makeComponentFixture } from "../../utils/testing/makeComponentFixture";
import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from "../../repositories/ordersRepository/utils/testing";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  user: UserEvent;
  orders: OrderEntity[];
  ordersServiceMock: MockedOrdersService;
}

describe(`${useTotalItemsQuantitySelector.name}`, () => {
  const ordersServiceMock = makeOrdersServiceMock();

  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();

    resetOrderEntitiesFactories();

    const { Fixture, user } = makeComponentFixture();
    context.Fixture = Fixture;
    context.user = user;
    context.orders = makeOrderEntities();
    context.ordersServiceMock = ordersServiceMock.mock;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it<LocalTestContext>("returns 0 when there are no orders", async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTotalItemsQuantitySelector(), {
      wrapper: context.Fixture,
    });

    await vi.runAllTimersAsync();

    expect(result.current).toBe(0);
  });

  it<LocalTestContext>("returns 0 when the gateway fails to fetch orders", async (context) => {
    context.ordersServiceMock.getOrders.mockRejectedValueOnce([]);

    const { result } = renderHook(() => useTotalItemsQuantitySelector(), {
      wrapper: context.Fixture,
    });

    await vi.runAllTimersAsync();

    expect(result.current).toBe(0);
  });

  it<LocalTestContext>("returns total quantity of items in the order ", async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValueOnce(context.orders);

    const { result } = renderHook(() => useTotalItemsQuantitySelector(), {
      wrapper: context.Fixture,
    });

    await vi.runAllTimersAsync();

    expect(result.current).toBe(1825);
  });
});
