import type { ItemEntityId, OrderEntityId } from "../../types";

export function isOrderItemMutationVariables(
  variables: unknown,
): variables is { orderId: OrderEntityId; itemId: ItemEntityId } {
  return (
    typeof variables === "object" &&
    variables !== null &&
    "orderId" in variables &&
    "itemId" in variables
  );
}
