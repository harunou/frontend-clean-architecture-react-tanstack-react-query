import type { FC, PropsWithChildren } from "react";
import { describe, beforeEach, vi, afterEach, it, expect, assert } from "vitest";
import { makeDeferred, output } from "../../../../utils/testing";
import type { OrderEntity, OrderEntityId } from "../../repositories/ordersRepository";
import { makeOrderEntityId } from "../../utils";
import { makeOrderEntities, resetOrderEntitiesFactories } from "../../utils/testing";
import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from "../../repositories/ordersRepository/utils/testing";
import { makeComponentFixture } from "../../utils/testing/makeComponentFixture";
import { useOrderByIdSelector } from "./useOrderByIdSelector";
import { render, screen } from "@testing-library/react";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  Sut: FC<{ orderId: OrderEntityId }>;
  orderEntities: OrderEntity[];
  ordersServiceMock: MockedOrdersService;
}

type Output = {
  order?: OrderEntity;
};

const outputTestId = "output-test-id";

describe(`${useOrderByIdSelector.name}`, () => {
  const ordersServiceMock = makeOrdersServiceMock();

  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();
    resetOrderEntitiesFactories();

    const { Fixture } = makeComponentFixture();
    const Component: FC<{ orderId: OrderEntityId }> = ({ orderId }) => {
      const order = useOrderByIdSelector(orderId);
      return (
        <div data-testid={outputTestId}>
          {output<Output>({
            order,
          })}
        </div>
      );
    };

    context.Fixture = Fixture;
    context.Sut = ({ orderId }) => {
      return (
        <Fixture>
          <Component orderId={orderId} />
        </Fixture>
      );
    };
    context.orderEntities = makeOrderEntities(3);
    context.ordersServiceMock = ordersServiceMock.mock;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it<LocalTestContext>("returns undefined when no orders are available", async (context) => {
    const orderId = makeOrderEntityId("9000");
    context.ordersServiceMock.getOrders.mockResolvedValue([]);

    render(<context.Sut orderId={orderId} />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({});
  });

  it<LocalTestContext>("returns the correct order when it exists", async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities);
    const targetOrder = context.orderEntities.at(1);
    assert(targetOrder);

    const orderId = targetOrder.id;

    render(<context.Sut orderId={orderId} />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      order: targetOrder,
    });
  });

  it<LocalTestContext>("returns undefined when the order with the given ID does not exist", async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities);
    const nonExistentOrderId = makeOrderEntityId("non-existent-id");

    render(<context.Sut orderId={nonExistentOrderId} />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({});
  });

  it<LocalTestContext>("returns undefined while orders are being loaded", async (context) => {
    const { promise } = makeDeferred<OrderEntity[]>();
    context.ordersServiceMock.getOrders.mockReturnValue(promise);
    const orderId = makeOrderEntityId("123");

    render(<context.Sut orderId={orderId} />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({});
  });

  it<LocalTestContext>("returns the first order when searching for the first order ID", async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities);
    const firstOrder = context.orderEntities.at(0);
    assert(firstOrder);
    const orderId = firstOrder.id;

    render(<context.Sut orderId={orderId} />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      order: firstOrder,
    });
  });

  it<LocalTestContext>("returns the last order when searching for the last order ID", async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities);
    const lastOrder = context.orderEntities.at(-1);
    assert(lastOrder);
    const orderId = lastOrder.id;

    render(<context.Sut orderId={orderId} />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      order: lastOrder,
    });
  });
});
