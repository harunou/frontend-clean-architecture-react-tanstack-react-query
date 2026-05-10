import type { OrderEntityId } from "../../../repositories/ordersRepository";

export interface Presenter {
  orderIds: OrderEntityId[];
  isLoading: boolean;
  totalItemsQuantity: number;
}

export interface Controller {
  moduleDestroyed(): void;
}
