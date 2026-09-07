import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import CheckoutPage from "./CheckoutPage";
import * as client from "@/api/client";
import endpoints from "@/api/endpoints";

// Header pulls in SearchBar, its own network calls and now useAuth; none of
// that is under test here. The specifier has to match the one CheckoutPage
// imports — it used to point at a path that no longer exists, so the mock
// silently did nothing.
vi.mock("@/components/layout/Header/Header.jsx", () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

const ADDRESS = {
  id: "a1",
  name: "Ali Raza",
  line1: "12 Mall Road",
  city: "Lahore",
  phone: "03001234567",
};

const cartItem = (overrides = {}) => ({
  itemId: "1",
  quantity: 1,
  product: { price: "500", name: "Item", shopId: "s1", shopName: "Shop 1" },
  ...overrides,
});

// Only the fields checkout reads. The real payload carries the ledger too, but
// the page never touches it, and a fixture that mirrored the whole shape would
// need updating every time the wallet grows a field.
const ACTIVE_WALLET = { deactivated: false, deactivationMessage: null };

// Checkout loads the cart, the address book and the wallet in parallel, so the
// mock has to answer per endpoint rather than return one fixed payload.
const mockLoad = ({
  cart = [cartItem()],
  addresses = [ADDRESS],
  wallet = ACTIVE_WALLET,
} = {}) =>
  vi.spyOn(client, "get").mockImplementation((endpoint) => {
    if (endpoint === endpoints.cart.root) return Promise.resolve({ cart });
    if (endpoint === endpoints.addresses) return Promise.resolve({ addresses });
    if (endpoint === endpoints.wallet.root) return Promise.resolve({ wallet });
    return Promise.reject(new Error(`Unexpected endpoint: ${endpoint}`));
  });

const renderCheckout = async (options) => {
  mockLoad(options);
  const view = render(
    <BrowserRouter>
      <CheckoutPage />
    </BrowserRouter>
  );
  await waitFor(() => {
    expect(screen.queryByText(/Loading checkout/i)).not.toBeInTheDocument();
  });
  return view;
};

const summary = (view) => within(view.container.querySelector(".checkout-summary-card"));

const summaryValue = (view, label) =>
  summary(view).getByText(label).parentElement.lastElementChild.textContent;

describe("CheckoutPage totals", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("adds the shipping charge on top of subtotal, profit and tax", async () => {
    const view = await renderCheckout({
      cart: [
        cartItem({
          quantity: 2,
          product: { price: "500", originalPrice: "600", name: "Item", shopId: "s1", shopName: "Shop 1" },
        }),
      ],
    });

    // subtotal 1,000 + profit 100 + COD tax 44 + shipping 5.99 = 1,149.99
    // This is the one place the cart and checkout totals legitimately differ.
    expect(summaryValue(view, "Subtotal")).toBe("Rs. 1,000");
    expect(summaryValue(view, "Profit Apply")).toBe("Rs. 100");
    expect(summaryValue(view, "Shipping")).toBe("Rs. 5.99");
    expect(summaryValue(view, "COD Tax")).toBe("Rs. 44");
    expect(summaryValue(view, "Total")).toBe("Rs. 1,149.99");
  });

  it("excludes shipping from the taxable amount", async () => {
    const view = await renderCheckout({
      cart: [cartItem({ product: { price: "1,000", name: "Item", shopId: "s1", shopName: "Shop 1" } })],
    });

    // Tax is 4% of 1,000, not of 1,005.99.
    expect(summaryValue(view, "COD Tax")).toBe("Rs. 40");
  });

  it("drops the COD tax row and its charge when advance payment is chosen", async () => {
    const user = userEvent.setup();
    const view = await renderCheckout({
      cart: [cartItem({ product: { price: "1,000", name: "Item", shopId: "s1", shopName: "Shop 1" } })],
    });

    expect(summaryValue(view, "Total")).toBe("Rs. 1,045.99");

    await user.click(screen.getByRole("button", { name: /Advance Payment/i }));

    // The row goes away entirely rather than showing a zero.
    expect(summary(view).queryByText("COD Tax")).not.toBeInTheDocument();
    expect(summaryValue(view, "Total")).toBe("Rs. 1,005.99");
  });

  it("tells the user what advance payment saves them", async () => {
    const user = userEvent.setup();
    await renderCheckout({
      cart: [cartItem({ product: { price: "1,000", name: "Item", shopId: "s1", shopName: "Shop 1" } })],
    });

    expect(screen.queryByText(/Why pay in advance/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Advance Payment/i }));

    expect(screen.getByText(/Why pay in advance/i)).toBeInTheDocument();
    // The saving quoted must be the tax the summary just stopped charging.
    expect(screen.getByText(/you save Rs\. 40 on this order/i)).toBeInTheDocument();
  });

  it("shows the empty state instead of a summary when the cart is empty", async () => {
    await renderCheckout({ cart: [] });

    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    expect(screen.queryByText("Subtotal")).not.toBeInTheDocument();
  });
});

describe("CheckoutPage order placement", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the order with the shipping charge and COD payment type", async () => {
    const user = userEvent.setup();
    await renderCheckout({
      cart: [cartItem({ product: { price: "1,000", name: "Item", shopId: "s1", shopName: "Shop 1" } })],
    });
    const post = vi.spyOn(client, "post").mockResolvedValue({ order: { orderId: "ORD-1" } });

    await user.click(screen.getByRole("button", { name: /Buy Now/i }));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith(
        endpoints.orders,
        expect.objectContaining({
          addressId: ADDRESS.id,
          paymentType: "cod",
          shippingCharge: 5.99,
          // 1,000 + 4% tax (40) + 5.99 shipping
          totalAmount: 1045.99,
        })
      );
    });
  });

  it("moves to the confirmation step and shows the order id", async () => {
    const user = userEvent.setup();
    await renderCheckout();
    vi.spyOn(client, "post").mockResolvedValue({ order: { orderId: "ORD-42" } });

    await user.click(screen.getByRole("button", { name: /Buy Now/i }));

    expect(await screen.findByText(/Order confirmed/i)).toBeInTheDocument();
    // Rendered twice — in the page-level banner and in the confirm card.
    expect(screen.getAllByText(/ORD-42/).length).toBeGreaterThan(0);
  });

  it("lists every order when the cart is split across suppliers", async () => {
    const user = userEvent.setup();
    await renderCheckout({
      cart: [
        cartItem({ itemId: "1", product: { price: "500", name: "A", shopId: "s1", shopName: "Alpha Shop" } }),
        cartItem({ itemId: "2", product: { price: "300", name: "B", shopId: "s2", shopName: "Beta Shop" } }),
      ],
    });
    vi.spyOn(client, "post").mockResolvedValue({
      orders: [
        { orderId: "ORD-A", shopName: "Alpha Shop", totalAmount: 520 },
        { orderId: "ORD-B", shopName: "Beta Shop", totalAmount: 312 },
      ],
    });

    await user.click(screen.getByRole("button", { name: /Buy Now/i }));

    // Both suppliers' orders are on the receipt, not just the first.
    expect(await screen.findByText(/2 orders confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/Order ID: ORD-A/)).toBeInTheDocument();
    expect(screen.getByText(/Order ID: ORD-B/)).toBeInTheDocument();
    expect(screen.getByText("Alpha Shop")).toBeInTheDocument();
    expect(screen.getByText("Beta Shop")).toBeInTheDocument();
    expect(screen.getByText(/ship from 2 suppliers/i)).toBeInTheDocument();
  });

  it("keeps the single-order receipt when everything ships from one supplier", async () => {
    const user = userEvent.setup();
    await renderCheckout();
    vi.spyOn(client, "post").mockResolvedValue({
      orders: [{ orderId: "ORD-SOLO", shopName: "Shop 1", totalAmount: 505.99 }],
    });

    await user.click(screen.getByRole("button", { name: /Buy Now/i }));

    expect(await screen.findByText(/^Order confirmed$/i)).toBeInTheDocument();
    expect(screen.queryByText(/separate orders/i)).not.toBeInTheDocument();
  });

  it("surfaces the server's message when the order fails", async () => {
    const user = userEvent.setup();
    await renderCheckout();
    vi.spyOn(client, "post").mockRejectedValue(new Error("Item went out of stock"));

    await user.click(screen.getByRole("button", { name: /Buy Now/i }));

    expect(await screen.findByText("Item went out of stock")).toBeInTheDocument();
    // The user stays on the address step so they can retry.
    expect(screen.queryByText(/Order confirmed/i)).not.toBeInTheDocument();
  });

  it("disables the buy button when no address exists", async () => {
    await renderCheckout({ addresses: [] });

    expect(screen.getByRole("button", { name: /Buy Now/i })).toBeDisabled();
  });

  it("routes advance payment to the payment step instead of placing the order", async () => {
    const user = userEvent.setup();
    await renderCheckout();
    const post = vi.spyOn(client, "post").mockResolvedValue({ order: { orderId: "ORD-1" } });

    await user.click(screen.getByRole("button", { name: /Advance Payment/i }));
    await user.click(screen.getByRole("button", { name: /Pay Now/i }));

    expect(await screen.findByRole("button", { name: /^Pay$/i })).toBeInTheDocument();
    // Nothing is ordered until payment details clear validation.
    expect(post).not.toHaveBeenCalled();
  });
});

describe("CheckoutPage deactivated account", () => {
  const DEACTIVATED_WALLET = {
    deactivated: true,
    deactivationMessage:
      "Your account is deactivated because your wallet balance is Rs. -500 or lower.",
    support: { email: "support@resello.pk", phone: "0300 1234567" },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("explains the block and refuses to place the order", async () => {
    const user = userEvent.setup();
    await renderCheckout({ wallet: DEACTIVATED_WALLET });
    const post = vi.spyOn(client, "post").mockResolvedValue({ order: { orderId: "ORD-1" } });

    const alert = within(screen.getByRole("alert"));
    expect(alert.getByText("Your account is deactivated")).toBeInTheDocument();
    expect(alert.getByText(DEACTIVATED_WALLET.deactivationMessage)).toBeInTheDocument();

    // The banner alone isn't the block — the button has to be dead too, or a
    // deactivated reseller can still fire an order the server will only reject.
    const button = screen.getByRole("button", { name: /Account deactivated/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(post).not.toHaveBeenCalled();
  });

  it("gives the reseller a way to get in touch via email and does not show phone", async () => {
    await renderCheckout({ wallet: DEACTIVATED_WALLET });

    const alert = within(screen.getByRole("alert"));
    expect(alert.getByRole("link", { name: /support@resello\.pk/i })).toHaveAttribute(
      "href",
      "mailto:support@resello.pk"
    );
    expect(alert.queryByRole("link", { name: /0300/ })).not.toBeInTheDocument();
  });

  it("leaves an active account alone", async () => {
    await renderCheckout();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Buy Now/i })).toBeEnabled();
  });
});

describe("CheckoutPage payment validation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Gets to the payment step, which is only reachable via advance payment.
  const goToPayment = async (user) => {
    await renderCheckout();
    await user.click(screen.getByRole("button", { name: /Advance Payment/i }));
    await user.click(screen.getByRole("button", { name: /Pay Now/i }));
    return screen.findByRole("button", { name: /^Pay$/i });
  };

  it("blocks submission when bank details are incomplete", async () => {
    const user = userEvent.setup();
    const payButton = await goToPayment(user);
    const post = vi.spyOn(client, "post").mockResolvedValue({ order: {} });

    await user.click(payButton);

    expect(await screen.findByText(/complete bank account payment details/i)).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("rejects a malformed IBAN", async () => {
    const user = userEvent.setup();
    const payButton = await goToPayment(user);
    const post = vi.spyOn(client, "post").mockResolvedValue({ order: {} });

    await user.selectOptions(screen.getByRole("combobox"), "HBL");
    await user.type(screen.getByLabelText(/Account Number\/IBAN/i), "GB36HABB0000000000000000");
    await user.type(screen.getByLabelText(/CNIC/i), "3520212345671");

    await user.click(payButton);

    expect(await screen.findByText(/valid Pakistani IBAN/i)).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("rejects a malformed CNIC", async () => {
    const user = userEvent.setup();
    const payButton = await goToPayment(user);
    const post = vi.spyOn(client, "post").mockResolvedValue({ order: {} });

    await user.selectOptions(screen.getByRole("combobox"), "HBL");
    await user.type(screen.getByLabelText(/Account Number\/IBAN/i), "PK36HABB0000000000000000");
    await user.type(screen.getByLabelText(/CNIC/i), "352021");

    await user.click(payButton);

    expect(await screen.findByText(/CNIC in this format/i)).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("places the order once bank details are valid", async () => {
    const user = userEvent.setup();
    const payButton = await goToPayment(user);
    const post = vi.spyOn(client, "post").mockResolvedValue({ order: { orderId: "ORD-9" } });

    await user.selectOptions(screen.getByRole("combobox"), "HBL");
    await user.type(screen.getByLabelText(/Account Number\/IBAN/i), "PK36HABB0000000000000000");
    await user.type(screen.getByLabelText(/CNIC/i), "3520212345671");

    await user.click(payButton);

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith(
        endpoints.orders,
        // No COD tax on the posted total either — 500 + 5.99 shipping, not
        // 500 + 20 + 5.99. The waiver has to reach the server, not just the UI.
        expect.objectContaining({ paymentType: "advance", totalAmount: 505.99 })
      );
    });
  });

  it("formats IBAN and CNIC as the user types", async () => {
    const user = userEvent.setup();
    await goToPayment(user);

    const iban = screen.getByLabelText(/Account Number\/IBAN/i);
    await user.type(iban, "pk36habb0000");
    expect(iban).toHaveValue("PK36 HABB 0000");

    const cnic = screen.getByLabelText(/CNIC/i);
    await user.type(cnic, "3520212345671");
    expect(cnic).toHaveValue("35202-1234567-1");
  });
});

describe("CheckoutPage load failure", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the error rather than an empty checkout", async () => {
    vi.spyOn(client, "get").mockRejectedValue(new Error("Checkout service unavailable"));

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    );

    expect(await screen.findByText("Checkout service unavailable")).toBeInTheDocument();
  });
});
