import type { FC, PropsWithChildren } from "react";
import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import type { OrderEntity, OrdersResource } from "../../../types";
import { makeOrderEntities, resetOrderEntitiesFactories } from "../../../utils/testing";
import { makeComponentFixture } from "../../../utils/testing/makeComponentFixture";
import { InMemoryOrdersGateway } from "../../../repositories/ordersRepository/OrdersGateway";
import { totalItemQuantityTestId, deleteItemButtonTestId } from "../../testIds";
import { Orders } from "./Orders";
import { deleteOrderButtonTestId } from "../../testIds";

const calculateTotalOrderItemsQuantity = (orders: OrderEntity[]) => {
  return orders.reduce(
    (acc, entity) =>
      acc + entity.itemEntities.reduce((itemAcc, item) => itemAcc + item.quantity, 0),
    0,
  );
};

describe(`${Orders.displayName} Integration Test`, () => {
  interface IntegrationTestContext {
    Fixture: FC<PropsWithChildren<unknown>>;
    Sut: FC<{ resource?: OrdersResource }>;
    user: UserEvent;
    orderEntities: OrderEntity[];
    inMemoryOrdersGateway: InMemoryOrdersGateway;
  }

  beforeEach<IntegrationTestContext>((context) => {
    vi.useFakeTimers();
    resetOrderEntitiesFactories();

    const { Fixture, user } = makeComponentFixture();

    context.Fixture = Fixture;
    context.Sut = () => (
      <Fixture>
        <Orders />
      </Fixture>
    );
    context.user = user;
    context.orderEntities = makeOrderEntities();
    context.inMemoryOrdersGateway = InMemoryOrdersGateway.make();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it<IntegrationTestContext>("displays orders from in-memory gateway", async (context) => {
    const initialOrders = context.orderEntities;
    context.inMemoryOrdersGateway.setOrders(context.orderEntities);

    render(<context.Sut />);
    await vi.runAllTimersAsync();

    const expectedTotalQuantity = calculateTotalOrderItemsQuantity(initialOrders);

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent(
      expectedTotalQuantity.toString(),
    );
  });

  it<IntegrationTestContext>("handles order deletion through the UI", async (context) => {
    const initialOrders = context.orderEntities;
    context.inMemoryOrdersGateway.setOrders(context.orderEntities);

    render(<context.Sut />);
    await vi.runAllTimersAsync();

    // Verify initial total quantity
    const initialTotalQuantity = calculateTotalOrderItemsQuantity(initialOrders);
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent(
      initialTotalQuantity.toString(),
    );

    // Delete the first order
    const deleteButtons = screen.getAllByTestId(deleteOrderButtonTestId);
    context.user.click(deleteButtons[0]);
    await vi.runAllTimersAsync();

    // Verify total quantity after deletion
    const remainingOrders = initialOrders.slice(1);
    const remainingTotalQuantity = calculateTotalOrderItemsQuantity(remainingOrders);
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent(
      remainingTotalQuantity.toString(),
    );
  });

  it<IntegrationTestContext>("handles order deletion followed by item deletion", async (context) => {
    const initialOrders = context.orderEntities;
    context.inMemoryOrdersGateway.setOrders(context.orderEntities);

    render(<context.Sut />);
    await vi.runAllTimersAsync();

    // Verify initial total quantity
    const initialTotalQuantity = calculateTotalOrderItemsQuantity(initialOrders);
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent(
      initialTotalQuantity.toString(),
    );

    // Step 1: Delete the first order
    const deleteOrderButtons = screen.getAllByTestId(deleteOrderButtonTestId);
    context.user.click(deleteOrderButtons[0]);
    await vi.runAllTimersAsync();

    // Verify total quantity after order deletion
    const remainingOrdersAfterOrderDeletion = initialOrders.slice(1);
    const totalQuantityAfterOrderDeletion = calculateTotalOrderItemsQuantity(
      remainingOrdersAfterOrderDeletion,
    );
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent(
      totalQuantityAfterOrderDeletion.toString(),
    );

    // Step 2: Delete an item from the remaining first order
    // First, expand the details to see items
    const detailsElements = screen.getAllByText("items");
    context.user.click(detailsElements[0]);
    await vi.runAllTimersAsync();

    // Delete the first item
    const deleteItemButtons = screen.getAllByTestId(deleteItemButtonTestId);
    if (deleteItemButtons.length > 0) {
      context.user.click(deleteItemButtons[0]);
      await vi.runAllTimersAsync();

      // Calculate expected total quantity after item deletion
      const orderWithItemDeleted = {
        ...remainingOrdersAfterOrderDeletion[0],
        itemEntities: remainingOrdersAfterOrderDeletion[0].itemEntities.slice(1),
      };
      const ordersAfterItemDeletion = [
        orderWithItemDeleted,
        ...remainingOrdersAfterOrderDeletion.slice(1),
      ];
      const finalTotalQuantity = calculateTotalOrderItemsQuantity(ordersAfterItemDeletion);

      expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent(
        finalTotalQuantity.toString(),
      );
    }
  });
});
