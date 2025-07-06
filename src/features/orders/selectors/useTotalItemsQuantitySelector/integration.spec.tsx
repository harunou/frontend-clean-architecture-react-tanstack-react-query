import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTotalItemsQuantitySelector } from "./useTotalItemsQuantitySelector";
import { render, screen } from "@testing-library/react";
import { memo, type FC, type PropsWithChildren } from "react";
import type { UserEvent } from "@testing-library/user-event";
import { output } from "../../../../utils/testing";
import { ordersRepository } from "../../repositories";
import type { OrderEntity, OrderEntityId, ItemEntityId } from "../../types";
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

describe(`${useTotalItemsQuantitySelector.name} Integration Test for Order deletion`, () => {
  type OrderDeletionTextContext = LocalTestContext & {
    Sut: FC<{ orderId: OrderEntityId }>;
  };
  beforeEach<OrderDeletionTextContext>((context) => {
    vi.useFakeTimers();

    resetOrderEntitiesFactories();

    const { Fixture, user } = makeComponentFixture();
    context.Fixture = Fixture;
    context.user = user;
    context.orders = makeOrderEntities();
    context.mockedOrdersGateway = mockUseOrdersGateway();
    context.inMemoryOrdersGateway = InMemoryOrdersGateway.make();

    const Component: FC<{ orderId: OrderEntityId }> = memo((props) => {
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
            onClick={() => deleteOrder({ orderId: props.orderId })}
          ></button>
        </>
      );
    });
    context.Sut = (props) => (
      <context.Fixture>
        <Component {...props} />
      </context.Fixture>
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  it<OrderDeletionTextContext>("changes value once an order is deleted (mocked gateway)", async (context) => {
    const fakeOrderId = makeOrderEntityId("9000");

    const initialOrders = context.orders.slice();
    const tailOrders = context.orders.slice(1);

    context.mockedOrdersGateway.getOrders
      .mockResolvedValueOnce(initialOrders)
      .mockResolvedValueOnce(tailOrders);
    context.mockedOrdersGateway.deleteOrder.mockResolvedValueOnce();

    render(<context.Sut orderId={fakeOrderId} />);

    await vi.runAllTimersAsync();

    const deleteButton = screen.getByTestId(deleteOrderButtonTestId);

    context.user.click(deleteButton);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1460,
    });
  });

  it<OrderDeletionTextContext>("changes value once an order is deleted (in-memory gateway)", async (context) => {
    restoreMockedUseOrdersGateway();

    const orderId = context.orders.at(0)!.id;

    context.inMemoryOrdersGateway.setOrders(context.orders);

    render(<context.Sut orderId={orderId} />);

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
});

describe(`${useTotalItemsQuantitySelector.name} Integration Test for Order deletion followed by item deletion`, () => {
  type OrderAndItemDeletionTestContext = LocalTestContext & {
    Sut: FC<{ orderId: OrderEntityId; itemId: ItemEntityId }>;
  };
  beforeEach<OrderAndItemDeletionTestContext>((context) => {
    vi.useFakeTimers();

    resetOrderEntitiesFactories();

    const { Fixture, user } = makeComponentFixture();
    context.Fixture = Fixture;
    context.user = user;
    context.orders = makeOrderEntities();
    context.mockedOrdersGateway = mockUseOrdersGateway();
    context.inMemoryOrdersGateway = InMemoryOrdersGateway.make();

    const Component: FC<{ orderId: OrderEntityId; itemId: ItemEntityId }> = memo((props) => {
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
            onClick={() => deleteOrder({ orderId: props.orderId })}
          ></button>
          <button
            data-testid={deleteItemButtonTestId}
            onClick={() => deleteItem({ orderId: props.orderId, itemId: props.itemId })}
          ></button>
        </>
      );
    });
    context.Sut = (props) => (
      <context.Fixture>
        <Component {...props} />
      </context.Fixture>
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it<OrderAndItemDeletionTestContext>("changes value once an order deletion is followed by an item deletion (mocked gateway)", async (context) => {
    const fakeOrderId = makeOrderEntityId("9000");
    const fakeItemId = makeItemEntityId("9000");

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
    context.mockedOrdersGateway.deleteOrder.mockResolvedValueOnce();
    context.mockedOrdersGateway.deleteItem.mockResolvedValueOnce();

    render(<context.Sut orderId={fakeOrderId} itemId={fakeItemId} />);

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

  it<OrderAndItemDeletionTestContext>("changes value once an order deletion is followed by an item deletion (in-memory gateway)", async (context) => {
    restoreMockedUseOrdersGateway();

    const orderIdToDelete = context.orders.at(0)!.id;
    const remainingOrder = context.orders.at(1)!;
    const itemIdToDelete = remainingOrder.itemEntities.at(0)!.id;

    context.inMemoryOrdersGateway.setOrders(context.orders);

    const { rerender } = render(<context.Sut orderId={orderIdToDelete} itemId={itemIdToDelete} />);

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

    // Step 2: Rerender with the remaining order and delete item from it
    rerender(<context.Sut orderId={remainingOrder.id} itemId={itemIdToDelete} />);
    await vi.runAllTimersAsync();

    const deleteItemButton = screen.getByTestId(deleteItemButtonTestId);
    context.user.click(deleteItemButton);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(outputTestId)).toHaveOutput<Output>({
      quantity: 1385,
    });
  });
});
