import type { FC } from "react";
import { memo, useEffect } from "react";
import { ordersTestId, totalItemQuantityTestId } from "../../testIds";
import { useController, usePresenter } from "./hooks";
import { Order } from "../Order";
import { OrdersResourcePicker } from "../OrdersResourcePicker";

export const Orders: FC = memo(() => {
  const presenter = usePresenter();
  const controller = useController();

  useEffect(() => {
    return () => controller.moduleDestroyed();
  }, [controller]);

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
});

Orders.displayName = "Orders";
