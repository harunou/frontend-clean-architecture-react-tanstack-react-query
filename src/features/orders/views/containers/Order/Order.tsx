import type { FC } from "react";
import { memo } from "react";
import type { OrderParams } from "./Order.types";
import { OrderItem } from "../OrderItem";
import { deleteOrderButtonTestId, orderTestId } from "../../testIds";
import { useController, usePresenter } from "./hooks";

export const Order: FC<OrderParams> = memo((props) => {
  const presenter = usePresenter(props);
  const { deleteOrderButtonClicked } = useController(props);

  if (!presenter.hasOrder) {
    return null;
  }

  return (
    <div
      style={{
        border: "1px solid red",
        marginBottom: `${presenter.isLastOrder ? "0px" : "3px"}`,
        padding: "5px",
      }}
      data-testid={orderTestId}
    >
      <button
        data-testid={deleteOrderButtonTestId}
        disabled={presenter.isDeleteOrderButtonDisabled}
        onClick={deleteOrderButtonClicked}
      >
        Delete Order
      </button>
      <div>OrderId: {presenter.orderId}</div>
      <div>User: {presenter.userId}</div>
      <details>
        <summary>items</summary>
        {presenter.itemIds.map((itemId) => (
          <OrderItem key={itemId} orderId={props.orderId} itemId={itemId} />
        ))}
      </details>
    </div>
  );
});

Order.displayName = "Order";
