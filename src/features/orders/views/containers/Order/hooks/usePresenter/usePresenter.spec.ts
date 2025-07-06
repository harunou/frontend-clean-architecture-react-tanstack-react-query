import { renderHook } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import type { OrderEntity } from "../../../../../types";
import {
  makeOrderEntities,
  mockUseOrdersGateway,
  resetOrderEntitiesFactories,
  type MockedOrdersGateway,
} from "../../../../../utils/testing";
import { makeComponentFixture } from "../../../../../utils/testing/makeComponentFixture";
import { usePresenter } from "./usePresenter";
import { makeDeferred } from "../../../../../../../utils/testing";
import { ordersRepository } from "../../../../../repositories";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  ordersGateway: MockedOrdersGateway;
  orders: OrderEntity[];
}

describe(`${usePresenter.name}`, () => {
  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();
    resetOrderEntitiesFactories();

    const { Fixture } = makeComponentFixture();
    context.Fixture = Fixture;
    context.ordersGateway = mockUseOrdersGateway();
    context.orders = makeOrderEntities();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it<LocalTestContext>("disables delete order button once deletion process in progress", async (context) => {
    const order0 = context.orders.at(1)!;
    const { promise } = makeDeferred<void>();
    context.ordersGateway.getOrders.mockResolvedValue(context.orders);
    context.ordersGateway.deleteOrder.mockReturnValue(promise);

    const { result: resultPresenter } = renderHook(() => usePresenter({ orderId: order0.id }), {
      wrapper: context.Fixture,
    });
    const { result: resultDeleteOrder } = renderHook(
      () => ordersRepository.useDeleteOrder("local"),
      {
        wrapper: context.Fixture,
      },
    );

    await vi.runAllTimersAsync();

    const result0 =
      resultPresenter.current.hasOrder && resultPresenter.current.isDeleteOrderButtonDisabled;

    resultDeleteOrder.current.mutate({ orderId: order0.id });

    await vi.runAllTimersAsync();

    const result1 =
      resultPresenter.current.hasOrder && resultPresenter.current.isDeleteOrderButtonDisabled;

    expect(result0).toBe(false);
    expect(result1).toBe(true);
  });
});
