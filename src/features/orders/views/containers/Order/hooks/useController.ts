import { useCallback } from "react";
import type { Controller } from "../Order.types";
import type { OrderEntityId } from "../../../../types";
import { useDeleteOrderUseCase } from "../../../../useCases";

export const useController = (params: { orderId: OrderEntityId }): Controller => {
  const { execute: executeDeleteOrderUseCase } = useDeleteOrderUseCase();

  const deleteOrderButtonClicked = useCallback(() => {
    executeDeleteOrderUseCase(params);
  }, [executeDeleteOrderUseCase, params]);

  return {
    deleteOrderButtonClicked,
  };
};
