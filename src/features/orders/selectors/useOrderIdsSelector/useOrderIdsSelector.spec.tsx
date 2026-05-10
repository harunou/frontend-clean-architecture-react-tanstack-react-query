import type { FC, PropsWithChildren } from "react";
import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import { makeDeferred, output } from "../../../../utils/testing";
import type { OrderEntity, OrderEntityId } from "../../repositories";
import { makeOrderEntities, resetOrderEntitiesFactories } from "../../utils/testing";
import { makeComponentFixture } from "../../utils/testing/makeComponentFixture";
import { useOrderIdsSelector } from "./useOrderIdsSelector";
import { render, screen } from "@testing-library/react";
import {
  makeOrdersServiceMock,
  type MockedOrdersService,
} from "../../repositories/ordersRepository/utils/testing";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  Sut: FC;
  orderEntities: OrderEntity[];
  ordersServiceMock: MockedOrdersService;
}

type Output = {
  orderIds: OrderEntityId[];
};

const outputTestId = "output-test-id";

describe(`${useOrderIdsSelector.name}`, () => {
  const ordersServiceMock = makeOrdersServiceMock();

  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();
    resetOrderEntitiesFactories();

    const { Fixture } = makeComponentFixture();
    const Component: FC = () => {
      const orderIds = useOrderIdsSelector();
      return (
        <div data-testid={outputTestId}>
          {output<Output>({
            orderIds,
          })}
        </div>
      );
    };

    context.Fixture = Fixture;
    context.Sut = () => {
      return (
        <Fixture>
          <Component />
        </Fixture>
      );
    };
    context.orderEntities = makeOrderEntities(3);
    context.ordersServiceMock = ordersServiceMock.mock;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it<LocalTestContext>("returns an empty array when no orders are available", async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue([]);

    render(<context.Sut />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      orderIds: [],
    });
  });

  it<LocalTestContext>("returns an array of order IDs when orders are available", async (context) => {
    context.ordersServiceMock.getOrders.mockResolvedValue(context.orderEntities);

    render(<context.Sut />);

    await vi.runAllTimersAsync();

    const expectedOrderIds = context.orderEntities.map((order) => order.id);
    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      orderIds: expectedOrderIds,
    });
  });

  it<LocalTestContext>("returns an empty array while orders are being loaded", async (context) => {
    const { promise } = makeDeferred<OrderEntity[]>();
    context.ordersServiceMock.getOrders.mockReturnValue(promise);

    render(<context.Sut />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      orderIds: [],
    });
  });
});
