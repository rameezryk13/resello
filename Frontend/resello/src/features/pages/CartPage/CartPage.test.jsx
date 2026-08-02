import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CartPage from "./CartPage";
import * as client from "../../../api/client";

// CartPage renders Header, which pulls in SearchBar and its own API calls.
// None of that is under test here, so the whole Header is stubbed out.
vi.mock("../../../components/Header/Header.jsx", () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

const cartItem = (overrides = {}) => ({
  itemId: "1",
  quantity: 1,
  product: { price: "500", name: "Item", shopId: "s1", shopName: "Shop 1" },
  ...overrides,
});

const renderCart = async (cart) => {
  vi.spyOn(client, "get").mockResolvedValue({ cart });
  const view = render(
    <BrowserRouter>
      <CartPage />
    </BrowserRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Loading cart/i)).not.toBeInTheDocument();
  });
  return view;
};

// Shop names and the word "Total" appear in both the items table and the
// summary card, so queries have to be scoped to one or the other.
const summary = (view) => within(view.container.querySelector(".cart-summary-card"));
const itemsCard = (view) => within(view.container.querySelector(".cart-items-card"));

// Each summary line is a row of <span>label</span><span>value</span>.
const summaryValue = (view, label) =>
  summary(view).getByText(label).parentElement.lastElementChild.textContent;

describe("CartPage totals calculation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("computes subtotal from item prices and quantities", async () => {
    const view = await renderCart([
      cartItem({ itemId: "1", quantity: 2, product: { price: "500", name: "A", shopId: "s1", shopName: "Shop 1" } }),
      cartItem({ itemId: "2", quantity: 1, product: { price: "1,200", name: "B", shopId: "s1", shopName: "Shop 1" } }),
    ]);

    // (500 x 2) + (1,200 x 1) = 2,200
    expect(summaryValue(view, "Subtotal")).toBe("Rs. 2,200");
  });

  it("derives profit from originalPrice minus price", async () => {
    const view = await renderCart([
      cartItem({
        product: { price: "800", originalPrice: "1,000", name: "Discounted", shopId: "s1", shopName: "Shop 1" },
      }),
    ]);

    expect(summaryValue(view, "Profit Apply")).toBe("Rs. 200");
  });

  it("prefers an explicit profit field over the price difference", async () => {
    const view = await renderCart([
      cartItem({
        profit: 350,
        product: { price: "500", originalPrice: "600", name: "Item", shopId: "s1", shopName: "Shop 1" },
      }),
    ]);

    // The price difference would give 100; the explicit field wins.
    expect(summaryValue(view, "Profit Apply")).toBe("Rs. 350");
  });

  it("reports no profit when originalPrice is absent", async () => {
    const view = await renderCart([cartItem({ quantity: 2 })]);

    expect(summaryValue(view, "Profit Apply")).toBe("Rs. 0");
  });

  it("reports no profit when originalPrice is below price", async () => {
    // Guards the Math.max(0, ...) floor: a bad record must not credit the
    // buyer with negative profit, which would understate the total.
    const view = await renderCart([
      cartItem({ product: { price: "900", originalPrice: "700", name: "Odd", shopId: "s1", shopName: "Shop 1" } }),
    ]);

    expect(summaryValue(view, "Profit Apply")).toBe("Rs. 0");
  });

  it("charges tax at 3% of subtotal plus profit", async () => {
    const view = await renderCart([
      cartItem({
        product: { price: "1,000", originalPrice: "1,200", name: "Item", shopId: "s1", shopName: "Shop 1" },
      }),
    ]);

    // (1,000 subtotal + 200 profit) x 0.03 = 36
    expect(summaryValue(view, "Tax")).toContain("Rs. 36");
  });

  it("totals subtotal, profit and tax together", async () => {
    const view = await renderCart([
      cartItem({
        quantity: 2,
        product: { price: "500", originalPrice: "600", name: "Item", shopId: "s1", shopName: "Shop 1" },
      }),
    ]);

    // subtotal 1,000 + profit 100 + tax 33 = 1,133
    expect(summaryValue(view, "Subtotal")).toBe("Rs. 1,000");
    expect(summaryValue(view, "Profit Apply")).toBe("Rs. 100");
    expect(summaryValue(view, "Tax")).toContain("Rs. 33");
    expect(summaryValue(view, "Total")).toBe("Rs. 1,133");
  });

  it("parses prices that arrive with commas and a currency prefix", async () => {
    // The backend is inconsistent about this, so parsePrice has to cope.
    const view = await renderCart([
      cartItem({ product: { price: "Rs. 2,500", name: "Item", shopId: "s1", shopName: "Shop 1" } }),
    ]);

    expect(summaryValue(view, "Subtotal")).toBe("Rs. 2,500");
  });

  it("shows the empty state and no summary for an empty cart", async () => {
    await renderCart([]);

    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.queryByText("Subtotal")).not.toBeInTheDocument();
  });
});

describe("CartPage grouping by shop", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("collects items from the same shop into one section", async () => {
    const view = await renderCart([
      cartItem({ itemId: "1", product: { price: "100", name: "A", shopId: "s1", shopName: "Alpha Shop" } }),
      cartItem({ itemId: "2", product: { price: "200", name: "B", shopId: "s2", shopName: "Beta Shop" } }),
      cartItem({ itemId: "3", product: { price: "300", name: "C", shopId: "s1", shopName: "Alpha Shop" } }),
    ]);

    const sections = view.container.querySelectorAll(".cart-shop-section");
    expect(sections).toHaveLength(2);

    // Alpha keeps both of its items even though a Beta item sits between them.
    const alpha = itemsCard(view).getByText("Alpha Shop").closest(".cart-shop-section");
    expect(alpha).toHaveTextContent("2 items");
    expect(within(alpha).getByText("A")).toBeInTheDocument();
    expect(within(alpha).getByText("C")).toBeInTheDocument();

    const beta = itemsCard(view).getByText("Beta Shop").closest(".cart-shop-section");
    expect(beta).toHaveTextContent("1 item");
  });

  it("falls back to a placeholder when the product has no shop", async () => {
    const view = await renderCart([
      cartItem({ product: { price: "100", name: "Orphan" } }),
    ]);

    expect(itemsCard(view).getByText("Unknown Shop")).toBeInTheDocument();
  });
});

describe("CartPage load failure", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the server's message and a retry button", async () => {
    vi.spyOn(client, "get").mockRejectedValue(new Error("Cart service unavailable"));

    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Cart service unavailable")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Try again/i })).toBeInTheDocument();
  });
});
