import type { ItemEntityId, OrderEntityId } from "../../repositories/ordersRepository";

export interface OrderParams {
  orderId: OrderEntityId;
}

interface PresenterWithoutOrder {
  hasOrder: false;
}

interface PresenterWithOrder {
  hasOrder: true;
  orderId: string;
  userId: string;
  itemIds: ItemEntityId[];
  isLastOrder: boolean;
  isDeleteOrderButtonDisabled: boolean;
}

export type Presenter = PresenterWithoutOrder | PresenterWithOrder;

export interface Controller {
  deleteOrderButtonClicked: () => void;
}
