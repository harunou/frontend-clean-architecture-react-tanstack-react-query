import { useCallback } from "react";
import { useDeleteOrderUseCase } from "../../../../useCases";
import type { DeleteOrderController } from "../DeleteOrder.types";
import type { OrderEntityId } from "../../../../types";
import { usePresenter } from "./usePresenter";

export const useController = (): DeleteOrderController => {
  const presenter = usePresenter();
  const { execute: executeDeleteOrderUseCase } = useDeleteOrderUseCase();
  return useCallback(
    async (id: unknown) => {
      if (!isOrderEntityId(id)) {
        return "Invalid order id";
      }
      const result = await executeDeleteOrderUseCase({ orderId: id });
      return presenter({ orderId: id, result });
    },
    [executeDeleteOrderUseCase, presenter],
  );
};

const isOrderEntityId = (id: unknown): id is OrderEntityId => {
  return typeof id === "string" && id.length > 0;
};
