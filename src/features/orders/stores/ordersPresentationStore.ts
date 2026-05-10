import { createStore } from "zustand/vanilla";
import type { OrdersResource } from "../types";
import type { OrdersPresentationEntity } from "./ordersPresentationStore.types";

export interface OrdersPresentationStore extends OrdersPresentationEntity {
  setOrdersResource: (resource: OrdersResource) => void;
}

export const ordersPresentationStore = createStore<OrdersPresentationStore>((set) => ({
  ordersResource: "local",
  setOrdersResource: (resource: OrdersResource) =>
    set((state) => ({ ...state, ordersResource: resource })),
}));
