import type { UserEvent } from "@testing-library/user-event";
import type { FC, PropsWithChildren } from "react";
import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import { makeDeferred, output } from "../../../../utils/testing";
import type { OrderEntity } from "../../types";
import { makeOrderEntityId, makeItemEntityId } from "../../utils";
import { type MockedOrdersGateway, mockUseOrdersGateway } from "../../utils/testing";
import { makeComponentFixture } from "../../utils/testing/makeComponentFixture";
import { useIsOrdersProcessingSelector } from "./useIsOrdersProcessingSelector";
import { render, screen } from "@testing-library/react";
import { ordersRepository } from "../../repositories/ordersRepository";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  Sut: FC;
  user: UserEvent;
  ordersGateway: MockedOrdersGateway;
}

type Output = {
  isLoading: boolean;
};

const outputTestId = "output-test-id";
const deleteOrderItemButtonTestId = "delete-button-test-id";

describe(`${useIsOrdersProcessingSelector.name}`, () => {
  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();

    const orderId = makeOrderEntityId("3");
    const itemId = makeItemEntityId("5");

    const { Fixture, user } = makeComponentFixture();
    const Component: FC = () => {
      const isLoading = useIsOrdersProcessingSelector();
      const { mutateAsync: deleteOrderItem } = ordersRepository.useDeleteOrderItem("local");
      return (
        <>
          <button
            data-testid={deleteOrderItemButtonTestId}
            onClick={() => deleteOrderItem({ orderId, itemId })}
          >
            delete item
          </button>
          <div data-testid={outputTestId}>
            {output<Output>({
              isLoading,
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it<LocalTestContext>("displays isLoading as true when orders are being fetched", async (context) => {
    const { promise } = makeDeferred<OrderEntity[]>();
    context.ordersGateway.getOrders.mockReturnValue(promise);

    render(<context.Sut />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      isLoading: true,
    });
  });

  it<LocalTestContext>("displays isLoading as false when orders are fetched", async (context) => {
    context.ordersGateway.getOrders.mockResolvedValue([]);

    render(<context.Sut />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      isLoading: false,
    });
  });

  it<LocalTestContext>("displays isLoading as true when order item is being deleted", async (context) => {
    const { promise } = makeDeferred<void>();
    context.ordersGateway.getOrders.mockResolvedValue([]);
    context.ordersGateway.deleteItem.mockReturnValue(promise);

    render(<context.Sut />);

    await vi.runAllTimersAsync();

    context.user.click(screen.getByTestId(deleteOrderItemButtonTestId));

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      isLoading: true,
    });
  });
});
