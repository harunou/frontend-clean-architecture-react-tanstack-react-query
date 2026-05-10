import { memo, type FC } from "react";
import type { OrderParams } from "./Order.types";
import { OrderItem } from "../OrderItem";
import { deleteOrderButtonTestId, orderTestId } from "../../testIds";
import { useController, usePresenter } from "./hooks";

export const Order: FC<OrderParams> = memo((props) => {
  const presenter = usePresenter(props);
  const controller = useController(props);

  if (!presenter.hasOrder) {
    return null;
  }

  return (
    <div
      className={`card bg-base-200 shadow-md ${presenter.isLastOrder ? "" : "mb-3"}`}
      data-testid={orderTestId}
    >
      <div className="card-body p-4 gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-base-content/40 uppercase tracking-widest">Order</div>
            <code className="text-sm font-semibold">{presenter.orderId}</code>
            <div className="flex items-center gap-1 text-xs text-base-content/50">
              <span>User</span>
              <code>{presenter.userId}</code>
            </div>
          </div>
          <button
            className="btn btn-sm btn-error btn-outline shrink-0"
            data-testid={deleteOrderButtonTestId}
            disabled={presenter.isDeleteOrderButtonDisabled}
            onClick={controller.deleteOrderButtonClicked}
          >
            Delete Order
          </button>
        </div>
        <details className="group">
          <summary className="cursor-pointer select-none text-xs text-base-content/50 uppercase tracking-wider w-fit">
            {presenter.itemIds.length} item{presenter.itemIds.length !== 1 ? "s" : ""}
          </summary>
          <div className="mt-2 flex flex-col">
            {presenter.itemIds.map((itemId) => (
              <OrderItem key={itemId} orderId={props.orderId} itemId={itemId} />
            ))}
          </div>
        </details>
      </div>
    </div>
  );
});

Order.displayName = "Order";
