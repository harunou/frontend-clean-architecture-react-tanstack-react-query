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

  it<IntegrationTestContext>("displays orders", async (context) => {
    context.inMemoryOrdersGateway.setOrders(context.orderEntities);

    render(<context.Sut />);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent("1825");
  });

  it<IntegrationTestContext>("handles order deletion", async (context) => {
    context.inMemoryOrdersGateway.setOrders(context.orderEntities);

    render(<context.Sut />);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent("1825");

    // Delete the first order
    const deleteButtons = screen.getAllByTestId(deleteOrderButtonTestId);
    context.user.click(deleteButtons[0]);
    await vi.runAllTimersAsync();

    // Verify total quantity after deletion
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent("1460");
  });

  it<IntegrationTestContext>("handles order deletion followed by item deletion", async (context) => {
    context.inMemoryOrdersGateway.setOrders(context.orderEntities);

    render(<context.Sut />);
    await vi.runAllTimersAsync();

    // Verify initial total quantity
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent("1825");

    // Step 1: Delete the first order
    const deleteOrderButtons = screen.getAllByTestId(deleteOrderButtonTestId);
    context.user.click(deleteOrderButtons[0]);
    await vi.runAllTimersAsync();

    // Verify total quantity after order deletion
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent("1460");

    // Step 2: Delete an item from the remaining first order
    // First, expand the details to see items
    const detailsElements = screen.getAllByText("items");
    context.user.click(detailsElements[0]);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent("1385");
  });
});
