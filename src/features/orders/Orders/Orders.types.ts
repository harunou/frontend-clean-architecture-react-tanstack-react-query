import type { OrderEntityId } from "../repositories";

export interface Presenter {
  orderIds: OrderEntityId[];
  isLoading: boolean;
  totalItemsQuantity: number;
}

export interface Controller {
  moduleDestroyed(): void;
}
