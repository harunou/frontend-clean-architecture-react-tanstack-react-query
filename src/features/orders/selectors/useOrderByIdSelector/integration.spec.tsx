import type { FC, PropsWithChildren } from "react";
import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";
import { output } from "../../../../utils/testing";
import type { OrderEntity, OrderEntityId, OrdersResource } from "../../types";
import {
  type MockedOrdersGateway,
  mockUseOrdersGateway,
  makeOrderEntities,
  resetOrderEntitiesFactories,
  restoreMockedUseOrdersGateway,
} from "../../utils/testing";
import { makeComponentFixture } from "../../utils/testing/makeComponentFixture";
import { render, screen } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { useDeleteOrderUseCase } from "../../useCases";
import { ordersRepository } from "../../repositories";
import { useOrderByIdSelector } from "./useOrderByIdSelector";
import { makeOrderEntityId } from "../../utils";
import { InMemoryOrdersGateway } from "../../repositories/ordersRepository/OrdersGateway";

describe(`${useOrderByIdSelector.name}: Delete Order and Item`, () => {
  interface IntegrationTestContext {
    Fixture: FC<PropsWithChildren<unknown>>;
    Sut: FC<{ resource?: OrdersResource }>;
    user: UserEvent;
    ordersGateway: MockedOrdersGateway;
    orderEntities: OrderEntity[];
  }

  type IntegrationOutput = {
    orders: OrderEntity[];
    firstOrderIdFromSelector?: OrderEntityId;
  };

  const unknownOrderEntityId = makeOrderEntityId("unknown");

  const integrationOutputTestId = "integration-output-test-id";
  const deleteOrderButtonTestId = "delete-order-button-test-id";
  const deleteItemButtonTestId = "delete-item-button-test-id";

  beforeEach<IntegrationTestContext>((context) => {
    vi.useFakeTimers();
    resetOrderEntitiesFactories();

    const { Fixture, user } = makeComponentFixture();

    const Component: FC<{ resource: OrdersResource }> = (props) => {
      const { execute: executeDeleteOrder } = useDeleteOrderUseCase();
      const { mutateAsync: deleteOrderItem } = ordersRepository.useDeleteOrderItem(props.resource);
      const { data: orders } = ordersRepository.useGetOrders(props.resource);

      const firstOrder = orders.at(0);
      const secondOrderIdOrUnknown = firstOrder?.id ?? unknownOrderEntityId;
      const secondOrderFromSelector = useOrderByIdSelector(secondOrderIdOrUnknown);

      const onDeleteOrderButtonClick = () => {
        // Delete order with index 0
        const order = orders.at(0)!;
        executeDeleteOrder({ orderId: order.id });
      };

      const onDeleteItemButtonClick = () => {
        // Delete item with index 0 from remaining order with index 0
        const order = orders.at(0)!;
        const item = order.itemEntities.at(0)!;
        deleteOrderItem({
          orderId: order.id,
          itemId: item.id,
        });
      };

      return (
        <>
          <button data-testid={deleteOrderButtonTestId} onClick={onDeleteOrderButtonClick}>
            Delete Order
          </button>
          <button data-testid={deleteItemButtonTestId} onClick={onDeleteItemButtonClick}>
            Delete Item
          </button>
          <div data-testid={integrationOutputTestId}>
            {output<IntegrationOutput>({
              orders,
              firstOrderIdFromSelector: secondOrderFromSelector?.id,
            })}
          </div>
        </>
      );
    };
    context.Fixture = Fixture;
    context.Sut = (props) => (
      <Fixture>
        <Component resource={props.resource ?? "local"} />
      </Fixture>
    );
    context.user = user;
    context.ordersGateway = mockUseOrdersGateway();
    context.orderEntities = makeOrderEntities();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it<IntegrationTestContext>("deletes an order and then deletes an item from a remaining order (with mocked gateway)", async (context) => {
    const initialOrders = context.orderEntities;
    const orderToDelete = initialOrders.at(0)!;
    const remainingOrderWithItem = initialOrders.at(1)!;
    const itemToDelete = remainingOrderWithItem.itemEntities.at(0)!;

    const ordersAfterOrderDeletion = initialOrders.slice(1);

    const updatedRemainingOrder = {
      ...remainingOrderWithItem,
      itemEntities: remainingOrderWithItem.itemEntities.slice(1),
    };
    const ordersAfterItemDeletion = [updatedRemainingOrder, ...ordersAfterOrderDeletion.slice(1)];

    context.ordersGateway.getOrders
      .mockResolvedValueOnce(initialOrders)
      .mockResolvedValueOnce(ordersAfterOrderDeletion)
      .mockResolvedValueOnce(ordersAfterItemDeletion);

    context.ordersGateway.deleteOrder.mockResolvedValue();
    context.ordersGateway.deleteItem.mockResolvedValue();

    render(<context.Sut />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(integrationOutputTestId)).toHaveOutput<IntegrationOutput>({
      orders: initialOrders,
      firstOrderIdFromSelector: initialOrders.at(0)!.id,
    });

    // Step 1: Delete the order
    const deleteOrderButton = screen.getByTestId(deleteOrderButtonTestId);
    context.user.click(deleteOrderButton);
    await vi.runAllTimersAsync();

    expect(context.ordersGateway.deleteOrder).toHaveBeenCalledWith(orderToDelete.id);
    expect(screen.getByTestId(integrationOutputTestId)).toHaveOutput<IntegrationOutput>({
      orders: ordersAfterOrderDeletion,
      firstOrderIdFromSelector: ordersAfterOrderDeletion.at(0)!.id,
    });

    // Step 2: Delete an item from a remaining order
    const deleteItemButton = screen.getByTestId(deleteItemButtonTestId);
    context.user.click(deleteItemButton);
    await vi.runAllTimersAsync();

    expect(context.ordersGateway.deleteItem).toHaveBeenCalledWith(
      remainingOrderWithItem.id,
      itemToDelete.id,
    );

    expect(screen.getByTestId(integrationOutputTestId)).toHaveOutput<IntegrationOutput>({
      orders: ordersAfterItemDeletion,
      firstOrderIdFromSelector: ordersAfterItemDeletion.at(0)?.id,
    });
  });

  it<IntegrationTestContext>("deletes an order and then deletes an item from a remaining order (with in memory gateway)", async (context) => {
    restoreMockedUseOrdersGateway();

    const initialOrders = context.orderEntities;
    const remainingOrderWithItem = initialOrders.at(1)!;
    const ordersAfterOrderDeletion = initialOrders.slice(1);

    const updatedRemainingOrder = {
      ...remainingOrderWithItem,
      itemEntities: remainingOrderWithItem.itemEntities.slice(1),
    };
    const ordersAfterItemDeletion = [updatedRemainingOrder, ...ordersAfterOrderDeletion.slice(1)];

    InMemoryOrdersGateway.make(initialOrders);

    render(<context.Sut />);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId(integrationOutputTestId)).toHaveOutput<IntegrationOutput>({
      orders: initialOrders,
      firstOrderIdFromSelector: initialOrders.at(0)!.id,
    });

    // Step 1: Delete the order
    const deleteOrderButton = screen.getByTestId(deleteOrderButtonTestId);
    context.user.click(deleteOrderButton);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(integrationOutputTestId)).toHaveOutput<IntegrationOutput>({
      orders: ordersAfterOrderDeletion,
      firstOrderIdFromSelector: ordersAfterOrderDeletion.at(0)!.id,
    });

    // Step 2: Delete an item from a remaining order
    const deleteItemButton = screen.getByTestId(deleteItemButtonTestId);
    context.user.click(deleteItemButton);
    await vi.runAllTimersAsync();

    expect(screen.getByTestId(integrationOutputTestId)).toHaveOutput<IntegrationOutput>({
      orders: ordersAfterItemDeletion,
      firstOrderIdFromSelector: ordersAfterItemDeletion.at(0)?.id,
    });
  });
});
