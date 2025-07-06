import { type Mocked, vi } from "vitest";
import * as useOrdersGatewayModule from "../../repositories/ordersRepository/hooks/useOrdersGateway";
import type { OrdersGateway } from "../../repositories/ordersRepository/OrdersGateway/OrdersGateway.types";

export type MockedOrdersGateway = Mocked<OrdersGateway>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeNoMockDefined =
  (name: string) =>
  (..._args: any[]): any => {
    console.error(`Mock: ${name} method has no mock defined`, {
      args: _args,
    });
  };

export const mockUseOrdersGateway = (): MockedOrdersGateway => {
  const mock: MockedOrdersGateway = {
    getOrders: vi.fn(makeNoMockDefined("getOrders")),
    deleteOrder: vi.fn(makeNoMockDefined("deleteOrder")),
    deleteItem: vi.fn(makeNoMockDefined("deleteItem")),
  };

  vi.spyOn(useOrdersGatewayModule, "useOrdersGateway").mockReturnValue(mock);

  return mock;
};

export const restoreMockedUseOrdersGateway = (): void => {
  if (!vi.isMockFunction(useOrdersGatewayModule.useOrdersGateway)) {
    console.warn("useOrdersGateway is not mocked, cannot restore");
    return;
  }
  vi.mocked(useOrdersGatewayModule.useOrdersGateway).mockRestore();
};
