import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import OrdersPage from "./OrdersPage";
import * as client from "@/api/client";

vi.mock("@/components/layout/Header/Header.jsx", () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock("@/context/ToastContext", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

const mockOrders = [
  {
    orderId: "order-1",
    status: "Under Verification",
    totalAmount: 1500,
    profit: 300,
    shippingCharge: 150,
    itemCount: 1,
    createdAt: "2026-08-01T10:00:00.000Z",
    cart: [{ itemId: "item-1", quantity: 1, profit: 300, product: { name: "Kurti", price: 1200 } }],
  },
  {
    orderId: "order-2",
    status: "Verification Failed",
    totalAmount: 2000,
    profit: 400,
    shippingCharge: 150,
    itemCount: 1,
    createdAt: "2026-08-02T10:00:00.000Z",
    cart: [{ itemId: "item-2", quantity: 1, profit: 400, product: { name: "Shoes", price: 1850 } }],
  },
  {
    orderId: "order-3",
    status: "In Transit",
    totalAmount: 3000,
    profit: 500,
    shippingCharge: 150,
    itemCount: 1,
    createdAt: "2026-08-03T10:00:00.000Z",
    cart: [{ itemId: "item-3", quantity: 1, profit: 500, product: { name: "Bag", price: 2850 } }],
  },
  {
    orderId: "order-4",
    status: "In-progress",
    totalAmount: 2500,
    profit: 350,
    shippingCharge: 150,
    itemCount: 1,
    createdAt: "2026-08-04T10:00:00.000Z",
    cart: [{ itemId: "item-4", quantity: 1, profit: 350, product: { name: "Watch", price: 2350 } }],
  },
  {
    orderId: "order-5",
    status: "Delivered",
    totalAmount: 4000,
    profit: 600,
    shippingCharge: 150,
    itemCount: 1,
    createdAt: "2026-08-05T10:00:00.000Z",
    cart: [{ itemId: "item-5", quantity: 1, profit: 600, product: { name: "Ring", price: 3850 } }],
  },
  {
    orderId: "order-6",
    status: "Returned",
    totalAmount: 1800,
    profit: 200,
    shippingCharge: 150,
    itemCount: 1,
    createdAt: "2026-08-06T10:00:00.000Z",
    cart: [{ itemId: "item-6", quantity: 1, profit: 200, product: { name: "Shirt", price: 1650 } }],
  },
  {
    orderId: "order-7",
    status: "Cancelled",
    totalAmount: 1200,
    profit: 100,
    shippingCharge: 150,
    itemCount: 1,
    createdAt: "2026-08-07T10:00:00.000Z",
    cart: [{ itemId: "item-7", quantity: 1, profit: 100, product: { name: "Socks", price: 1050 } }],
  },
];

describe("OrdersPage - Status Tab Sequence", () => {
  beforeEach(() => {
    vi.spyOn(client, "get").mockResolvedValue({ orders: mockOrders });
  });

  it("renders status tabs in the exact sequence requested", async () => {
    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("order-1")).toBeInTheDocument();
    });

    const tabs = screen.getAllByRole("tab");
    const tabTexts = tabs.map((tab) => tab.getAttribute("aria-label") || tab.querySelector("span")?.textContent.trim());

    expect(tabTexts).toEqual([
      "All",
      "Under Verification",
      "Verification Failed",
      "In-progress",
      "In Transit",
      "Delivered",
      "Returned",
      "Cancelled",
    ]);
  });

  it("filters orders by In-progress", async () => {
    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("order-1")).toBeInTheDocument();
    });

    const inProgressTab = screen.getByRole("tab", { name: "In-progress" });
    fireEvent.click(inProgressTab);

    expect(screen.getByText("order-4")).toBeInTheDocument();
    expect(screen.queryByText("order-3")).not.toBeInTheDocument();
    expect(screen.queryByText("order-1")).not.toBeInTheDocument();
  });

  it("filters orders by In Transit", async () => {
    render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("order-1")).toBeInTheDocument();
    });

    const inTransitTab = screen.getByRole("tab", { name: "In Transit" });
    fireEvent.click(inTransitTab);

    expect(screen.getByText("order-3")).toBeInTheDocument();
    expect(screen.queryByText("order-4")).not.toBeInTheDocument();
    expect(screen.queryByText("order-1")).not.toBeInTheDocument();
  });
});
