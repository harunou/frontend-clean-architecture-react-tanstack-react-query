import { memo, type FC } from "react";
import { deleteItemButtonTestId, orderItemTestId } from "../../testIds";
import type { OrderItemProps } from "./OrderItem.types";
import { useController, usePresenter } from "./hooks";

export const OrderItem: FC<OrderItemProps> = memo((props) => {
  const presenter = usePresenter(props);
  const { deleteOrderItemButtonClicked } = useController(props);

  if (!presenter.hasItem) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg bg-base-300 ${presenter.isLastItem ? "" : "mb-1"}`}
      data-testid={orderItemTestId}
    >
      <div className="flex flex-1 gap-6 flex-wrap">
        <div>
          <div className="text-xs text-base-content/40 uppercase tracking-wider">id</div>
          <code className="text-sm">{presenter.itemId}</code>
        </div>
        <div>
          <div className="text-xs text-base-content/40 uppercase tracking-wider">product id</div>
          <code className="text-sm">{presenter.productId}</code>
        </div>
        <div>
          <div className="text-xs text-base-content/40 uppercase tracking-wider">quantity</div>
          <div className="badge badge-neutral badge-sm mt-1">{presenter.productQuantity}</div>
        </div>
      </div>
      <button
        className="btn btn-xs btn-error btn-outline"
        data-testid={deleteItemButtonTestId}
        disabled={presenter.isDeleteItemButtonDisabled}
        onClick={deleteOrderItemButtonClicked}
      >
        Delete Item
      </button>
    </div>
  );
});

OrderItem.displayName = "OrderItem";
