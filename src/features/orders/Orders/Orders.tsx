import type { FC } from "react";
import { memo, useEffect } from "react";
import { ordersTestId, totalItemQuantityTestId } from "../testIds";
import { useController, usePresenter } from "./hooks";
import { Order } from "../components/Order";
import { OrdersResourcePicker } from "../components/OrdersResourcePicker";

export const Orders: FC = memo(() => {
  const presenter = usePresenter();
  const controller = useController();

  useEffect(() => {
    return () => controller.moduleDestroyed();
  }, [controller]);

  return (
    <div className="w-[560px] max-w-full text-left" data-testid={ordersTestId}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold tracking-widest uppercase">Orders</h2>
        <div className="flex items-center gap-2">
          <div className="badge badge-ghost gap-1">
            <span data-testid={totalItemQuantityTestId}>{presenter.totalItemsQuantity}</span>
            <span>items</span>
          </div>
          <div className={`badge gap-1 ${presenter.isLoading ? "badge-warning" : "badge-success"}`}>
            {presenter.isLoading && <span className="loading loading-spinner loading-xs" />}
            {presenter.isLoading ? "loading" : "idle"}
          </div>
        </div>
      </div>
      <div className="mb-5">
        <div className="text-xs text-base-content/40 uppercase tracking-widest mb-2">Resource</div>
        <OrdersResourcePicker />
      </div>
      <div className="flex flex-col">
        {presenter.orderIds.map((orderId) => (
          <Order key={orderId} orderId={orderId} />
        ))}
      </div>
    </div>
  );
});

Orders.displayName = "Orders";
