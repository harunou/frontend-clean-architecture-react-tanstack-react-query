import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDeleteOrderUseCase } from "./useDeleteOrderUseCase";
import type { UserEvent } from "@testing-library/user-event";
import type { FC, PropsWithChildren } from "react";
import type { OrderEntity, OrderEntityId } from "../../types";
import {
  makeOrderEntities,
  type MockedOrdersGateway,
  resetOrderEntitiesFactories,
  mockUseOrdersGateway,
} from "../../utils/testing";
import { makeComponentFixture } from "../../utils/testing/makeComponentFixture";
import { useOrderIdsSelector } from "../../selectors";
import { output } from "../../../../utils/testing";
import { render, screen } from "@testing-library/react";
import { makeOrderEntityId } from "../../utils";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  Sut: FC;
  user: UserEvent;
  ordersGateway: MockedOrdersGateway;
  orders: OrderEntity[];
}

type Output = {
  ids: OrderEntityId[];
};

const outputTestId = "output-test-id";
const deleteOrderItemButtonTestId = "delete-button-test-id";

describe(`${useDeleteOrderUseCase.name}`, () => {
  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();
    resetOrderEntitiesFactories();

    const orderId = makeOrderEntityId("9000");

    const { Fixture, user } = makeComponentFixture();
    const Component: FC = () => {
      const { execute: executeDeleteOrder } = useDeleteOrderUseCase();
      const ids = useOrderIdsSelector();
      return (
        <>
          <button
            data-testid={deleteOrderItemButtonTestId}
            onClick={() => executeDeleteOrder({ orderId })}
          >
            delete item
          </button>
          <div data-testid={outputTestId}>
            {output<Output>({
              ids,
            })}
          </div>
        </>
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
    context.user = user;
    context.ordersGateway = mockUseOrdersGateway();
    context.orders = makeOrderEntities();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it<LocalTestContext>("deletes order by id", async (context) => {
    const orderToDelete = context.orders.at(2)!;
    const orders0 = [...context.orders];
    const orders1 = context.orders.filter((order) => order.id !== orderToDelete.id);

    context.ordersGateway.getOrders.mockResolvedValueOnce(orders0).mockResolvedValueOnce(orders1);
    context.ordersGateway.deleteOrder.mockResolvedValueOnce();

    render(<context.Sut />);

    await vi.runAllTimersAsync();

    const deleteButton = screen.getByTestId(deleteOrderItemButtonTestId);
    context.user.click(deleteButton);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      ids: orders1.map((order) => order.id),
    });
  });
});
