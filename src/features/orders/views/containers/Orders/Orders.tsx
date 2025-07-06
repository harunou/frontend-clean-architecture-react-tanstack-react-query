import type { FC } from "react";
import { useEffect } from "react";
import { ordersTestId, totalItemQuantityTestId } from "../../testIds";
import { useController, usePresenter } from "./hooks";
import { Order } from "../Order";
import { OrdersResourcePicker } from "../OrdersResourcePicker";

export const Orders: FC = () => {
  const presenter = usePresenter();
  const { moduleDestroyed } = useController();

  useEffect(() => {
    return () => moduleDestroyed();
  }, [moduleDestroyed]);

  return (
    <div data-testid={ordersTestId}>
      <div>Resource</div>
      <OrdersResourcePicker />
      <div>Orders</div>
      <div>
        Total Items Quantity:{" "}
        <span data-testid={totalItemQuantityTestId}>{presenter.totalItemsQuantity}</span>
      </div>
      <div>Status: {presenter.isLoading ? "loading..." : "idle"}</div>
      {presenter.orderIds.map((orderId) => (
        <Order key={orderId} orderId={orderId} />
      ))}
    </div>
  );
};

Orders.displayName = "Orders";
