import { render, screen } from "@testing-library/react";
import { describe, it, vi, expect, beforeEach } from "vitest";
import { Orders } from "./Orders";
import { useController, usePresenter } from "./hooks";
import { ordersTestId, totalItemQuantityTestId } from "../../testIds";
import type { OrderEntityId } from "../../../types";

vi.mock("./hooks/useController");
vi.mock("./hooks/usePresenter");
vi.mock("../Order/Order", () => ({
  Order: (props: { orderId: OrderEntityId }) => (
    <div data-testid={`order-${props.orderId}`}>Order {props.orderId}</div>
  ),
}));

describe(`${Orders.displayName}`, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useController).mockReturnValue({
      moduleDestroyed: vi.fn(),
    });
  });

  it("renders loading state", () => {
    vi.mocked(usePresenter).mockReturnValue({
      totalItemsQuantity: 0,
      isLoading: true,
      orderIds: [],
    });

    render(<Orders />);

    expect(screen.getByTestId(ordersTestId)).toBeInTheDocument();
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent("0");
    expect(screen.getByText("Status: loading...")).toBeInTheDocument();
  });

  it("renders multiple orders", () => {
    const orderIds = ["1", "2", "3"] as OrderEntityId[];
    vi.mocked(usePresenter).mockReturnValue({
      totalItemsQuantity: 5,
      isLoading: false,
      orderIds,
    });

    render(<Orders />);

    expect(screen.getByTestId(ordersTestId)).toBeInTheDocument();
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent("5");
    expect(screen.getByText("Status: idle")).toBeInTheDocument();
    orderIds.forEach((id) => {
      expect(screen.getByTestId(`order-${id}`)).toBeInTheDocument();
    });
  });

  it("renders empty state", () => {
    vi.mocked(usePresenter).mockReturnValue({
      totalItemsQuantity: 0,
      isLoading: false,
      orderIds: [],
    });

    render(<Orders />);

    expect(screen.getByTestId(ordersTestId)).toBeInTheDocument();
    expect(screen.getByTestId(totalItemQuantityTestId)).toHaveTextContent("0");
    expect(screen.getByText("Status: idle")).toBeInTheDocument();
    expect(screen.queryByTestId(/^order-/)).not.toBeInTheDocument();
  });

  it("calls moduleDestroyed on unmount", () => {
    vi.mocked(usePresenter).mockReturnValue({
      totalItemsQuantity: 0,
      isLoading: false,
      orderIds: [],
    });

    const controller = useController();
    const { unmount } = render(<Orders />);
    unmount();

    expect(controller.moduleDestroyed).toHaveBeenCalledTimes(1);
  });
});
