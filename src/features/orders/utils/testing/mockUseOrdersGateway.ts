import { type Mocked, vi } from "vitest";
import type { OrdersGateway } from "../../repositories/ordersRepository/ordersRepository.types";
import { OrdersService } from "../../repositories/ordersRepository/OrdersService";

export type MockedOrdersGateway = Mocked<OrdersGateway>;

const makeNoMockDefined =
  (name: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  vi.spyOn(OrdersService, "make").mockReturnValue(mock);

  return mock;
};

export const restoreMockedUseOrdersGateway = (): void => {
  if (!vi.isMockFunction(OrdersService.make)) {
    console.warn("OrdersService.make is not mocked, cannot restore");
    return;
  }
  vi.mocked(OrdersService.make).mockRestore();
};
