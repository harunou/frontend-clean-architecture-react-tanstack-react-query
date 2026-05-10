import { vi, beforeEach, afterEach, type Mocked, type MockInstance } from "vitest";
import type { OrdersGateway } from "../../ordersRepository.types";
import { OrdersService } from "../../OrdersService";

export type MockedOrdersService = Mocked<OrdersGateway>;

function makeMockInstance(): MockedOrdersService {
  return {
    getOrders: vi.fn<OrdersGateway["getOrders"]>().mockResolvedValue([]),
    deleteOrder: vi.fn<OrdersGateway["deleteOrder"]>(),
    deleteItem: vi.fn<OrdersGateway["deleteItem"]>(),
  };
}

export function makeOrdersServiceMock() {
  let mockInstance: MockedOrdersService;
  let makeSpy: MockInstance<() => OrdersGateway>;

  beforeEach(() => {
    mockInstance = makeMockInstance();
    makeSpy = vi.spyOn(OrdersService, "make").mockReturnValue(mockInstance);
  });

  afterEach(() => {
    makeSpy.mockRestore();
  });

  return {
    get mock() {
      return mockInstance;
    },
  };
}
