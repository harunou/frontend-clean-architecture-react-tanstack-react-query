import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTotalItemsQuantitySelector } from "./useTotalItemsQuantitySelector";
import { render, screen } from "@testing-library/react";
import { memo, type FC, type PropsWithChildren } from "react";
import type { UserEvent } from "@testing-library/user-event";
import { output } from "../../../../utils/testing";
import { ordersRepository } from "../../repositories";
import type { OrderEntity } from "../../types";
import { makeItemEntityId, makeOrderEntityId } from "../../utils";
import {
  resetOrderEntitiesFactories,
  restoreMockedUseOrdersGateway,
  makeOrderEntities,
  type MockedOrdersGateway,
  mockUseOrdersGateway,
} from "../../utils/testing";
import { makeComponentFixture } from "../../utils/testing/makeComponentFixture";
import { InMemoryOrdersGateway } from "../../repositories/ordersRepository/OrdersGateway";

interface LocalTestContext {
  Fixture: FC<PropsWithChildren<unknown>>;
  user: UserEvent;
  orders: OrderEntity[];
  mockedOrdersGateway: MockedOrdersGateway;
  inMemoryOrdersGateway: InMemoryOrdersGateway;
}

interface Output {
  quantity: number;
}

const outputTestId = "output-test-id";
const deleteOrderButtonTestId = "delete-order-button-test-id";
const deleteItemButtonTestId = "delete-item-button-test-id";

describe(`${useTotalItemsQuantitySelector.name} Integration Test`, () => {
  beforeEach<LocalTestContext>((context) => {
    vi.useFakeTimers();

    resetOrderEntitiesFactories();

    const { Fixture, user } = makeComponentFixture();
    context.Fixture = Fixture;
    context.user = user;
    context.orders = makeOrderEntities();
    context.mockedOrdersGateway = mockUseOrdersGateway();
    context.inMemoryOrdersGateway = InMemoryOrdersGateway.make();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it<LocalTestContext>("changes value once an order is deleted (mocked gateway)", async (context) => {
    const fakeOrderId = makeOrderEntityId("9000");
    const Component: FC = memo(() => {
      const quantity = useTotalItemsQuantitySelector();
      const { mutateAsync: deleteOrder } = ordersRepository.useDeleteOrder("local");
      return (
        <>
          <div data-testid={outputTestId}>
            {output<Output>({
              quantity,
            })}
          </div>
          <button
            data-testid={deleteOrderButtonTestId}
            onClick={() => deleteOrder({ orderId: fakeOrderId })}
          ></button>
        </>
      );
    });
    const Sut: FC = () => (
      <context.Fixture>
        <Component />
      </context.Fixture>
    );

    const initialOrders = context.orders.slice();
    const tailOrders = context.orders.slice(1);

    context.mockedOrdersGateway.getOrders
      .mockResolvedValueOnce(initialOrders)
      .mockResolvedValueOnce(tailOrders);
    context.mockedOrdersGateway.deleteOrder.mockResolvedValueOnce();

    render(<Sut />);

    await vi.runAllTimersAsync();

    const deleteButton = screen.getByTestId(deleteOrderButtonTestId);

    context.user.click(deleteButton);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1460,
    });
  });

  it<LocalTestContext>("changes value once an order is deleted (in-memory gateway)", async (context) => {
    restoreMockedUseOrdersGateway();

    const orderId = context.orders.at(0)!.id;
    const Component: FC = memo(() => {
      const quantity = useTotalItemsQuantitySelector();
      const { mutateAsync: deleteOrder } = ordersRepository.useDeleteOrder("local");
      return (
        <>
          <div data-testid={outputTestId}>
            {output<Output>({
              quantity,
            })}
          </div>
          <button
            data-testid={deleteOrderButtonTestId}
            onClick={() => deleteOrder({ orderId })}
          ></button>
        </>
      );
    });

    const Sut: FC = () => (
      <context.Fixture>
        <Component />
      </context.Fixture>
    );

    context.inMemoryOrdersGateway.setOrders(context.orders);

    render(<Sut />);

    await vi.runAllTimersAsync();

    // Initial state should show full quantity
    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1825,
    });

    const deleteButton = screen.getByTestId(deleteOrderButtonTestId);
    context.user.click(deleteButton);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1460,
    });
  });

  it<LocalTestContext>("changes value once an order deletion is followed by an item deletion (mocked gateway)", async (context) => {
    const fakeOrderId = makeOrderEntityId("9000");
    const fakeItemId = makeItemEntityId("9000");

    const Component: FC = memo(() => {
      const quantity = useTotalItemsQuantitySelector();
      const { mutateAsync: deleteOrder } = ordersRepository.useDeleteOrder("local");
      const { mutateAsync: deleteItem } = ordersRepository.useDeleteOrderItem("local");
      return (
        <>
          <div data-testid={outputTestId}>
            {output<Output>({
              quantity,
            })}
          </div>
          <button
            data-testid={deleteOrderButtonTestId}
            onClick={() => deleteOrder({ orderId: fakeOrderId })}
          ></button>
          <button
            data-testid={deleteItemButtonTestId}
            onClick={() => deleteItem({ orderId: fakeOrderId, itemId: fakeItemId })}
          ></button>
        </>
      );
    });

    const Sut: FC = () => (
      <context.Fixture>
        <Component />
      </context.Fixture>
    );

    const initialOrders = context.orders.slice();
    const tailOrders = context.orders.slice(1);

    const tailItems = tailOrders.at(0)!.itemEntities.slice(1);
    const tailOrdersWithTailItems = [
      {
        ...tailOrders.at(0)!,
        itemEntities: tailItems,
      },
      ...tailOrders.slice(1),
    ];

    context.mockedOrdersGateway.getOrders
      .mockResolvedValueOnce(initialOrders)
      .mockResolvedValueOnce(tailOrders)
      .mockResolvedValueOnce(tailOrdersWithTailItems);

    render(<Sut />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1825,
    });

    const deleteOrderButton = screen.getByTestId(deleteOrderButtonTestId);
    context.user.click(deleteOrderButton);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1460,
    });

    const deleteItemButton = screen.getByTestId(deleteItemButtonTestId);
    context.user.click(deleteItemButton);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1385,
    });
  });

  it<LocalTestContext>("changes value once an order deletion is followed by an item deletion (in-memory gateway)", async (context) => {
    restoreMockedUseOrdersGateway();

    const orderIdToDelete = context.orders.at(0)!.id;
    const orderId = context.orders.at(1)!.id;
    const itemIdToDelete = context.orders.at(1)!.itemEntities.at(0)!.id;

    const Component: FC = memo(() => {
      const quantity = useTotalItemsQuantitySelector();
      const { mutateAsync: deleteOrder } = ordersRepository.useDeleteOrder("local");
      const { mutateAsync: deleteItem } = ordersRepository.useDeleteOrderItem("local");
      return (
        <>
          <div data-testid={outputTestId}>
            {output<Output>({
              quantity,
            })}
          </div>
          <button
            data-testid={deleteOrderButtonTestId}
            onClick={() => deleteOrder({ orderId: orderIdToDelete })}
          ></button>
          <button
            data-testid={deleteItemButtonTestId}
            onClick={() => deleteItem({ orderId: orderId, itemId: itemIdToDelete })}
          ></button>
        </>
      );
    });

    const Sut: FC = () => (
      <context.Fixture>
        <Component />
      </context.Fixture>
    );

    context.inMemoryOrdersGateway.setOrders(context.orders);

    render(<Sut />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1825,
    });

    // Step 1: Delete order
    const deleteOrderButton = screen.getByTestId(deleteOrderButtonTestId);
    context.user.click(deleteOrderButton);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1460,
    });

    // Step 2: Delete item from remaining order
    const deleteItemButton = screen.getByTestId(deleteItemButtonTestId);
    context.user.click(deleteItemButton);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1385,
    });
  });
});
