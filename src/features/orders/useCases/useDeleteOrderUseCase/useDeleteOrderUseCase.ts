import { useCallback } from "react";
import type { UseCase } from "../../../../@types";
import type { OrderEntityId } from "../../types";
import { ordersRepository } from "../../repositories";

export const useDeleteOrderUseCase = (): UseCase<{ orderId: OrderEntityId }> => {
  const { mutateAsync: deleteOrder } = ordersRepository.useDeleteOrder();

  const execute = useCallback(
    async (params: { orderId: OrderEntityId }) => {
      try {
        await deleteOrder(params);
      } catch (e) {
        if (e instanceof Error) {
          return e;
        }
        return new Error("Unknown error");
      }
    },
    [deleteOrder],
  );

  return { execute };
};
