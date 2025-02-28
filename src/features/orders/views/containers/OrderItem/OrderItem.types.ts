import type { OrderEntityId, ItemEntityId } from "../../../types";

export interface OrderItemProps {
  orderId: OrderEntityId;
  itemId: ItemEntityId;
}

interface PresenterWithItem {
  hasItem: true;
  itemId: ItemEntityId;
  productId: string;
  productQuantity: number;
  isLastItem: boolean;
}
interface PresenterWithoutItem {
  hasItem: false;
}

export type Presenter = PresenterWithItem | PresenterWithoutItem;

export interface Controller {
  deleteOrderItemButtonClicked: () => void;
}
