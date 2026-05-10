import { renderHook } from "@testing-library/react";
import type { FC, PropsWithChildren } from "react";
import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import type { OrderEntity } from "../../../../../repositories/ordersRepository";
import { makeOrderEntities, resetOrderEntitiesFactories } from "../../../../../utils/testing";
import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from "../../../../../repositories/ordersRepository/utils/testing";
import { makeComponentFixture } from "../../../../../utils/testing/makeComponentFixture";
import { usePresenter } from "./usePresenter";
import { makeDeferred } from "../../../../../../../utils/testing";
import { ordersRepository } from "../../../../../repositories";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  orders: OrderEntity[];
  ordersServiceMock: MockedOrdersService;
}

describe(`${usePresenter.name}`, () => {
  const ordersServiceMock = makeOrdersServiceMock();

  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();
    resetOrderEntitiesFactories();

    const { Fixture } = makeComponentFixture();
    context.Fixture = Fixture;
    context.orders = makeOrderEntities();
    context.ordersServiceMock = ordersServiceMock.mock;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it<LocalTestContext>("disables delete order button once deletion process in progress", async (context) => {
    const order0 = context.orders.at(1)!;
    const { promise } = makeDeferred<void>();
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orders);
    context.ordersServiceMock.deleteOrder.mockReturnValue(promise);

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
