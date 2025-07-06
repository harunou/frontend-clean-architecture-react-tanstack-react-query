import { useCallback } from "react";
import type { Controller } from "../Orders.types";
import { ordersRepository } from "../../../../repositories";

export const useController = (): Controller => {
  const cancelAllQueries = ordersRepository.useCancelAllQueries();

  const moduleDestroyed = useCallback(() => {
    cancelAllQueries();
  }, [cancelAllQueries]);

  return { moduleDestroyed };
};
