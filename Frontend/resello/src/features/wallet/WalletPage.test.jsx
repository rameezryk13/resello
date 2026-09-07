import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import WalletPage from "./WalletPage";
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

const mockWallet = {
  balance: 450,
  pendingCommission: 200,
  clearedCommission: 650,
  penaltyTotal: 100,
  shippingReturnPayment: 250,
  shippingAndReturnTotal: 250,
  penalties: [
    { id: "p1", orderId: "ord-1", amount: 100, createdAt: "2026-08-01T10:00:00.000Z" },
  ],
  transactions: [
    {
      id: "txn-1",
      type: "commission",
      direction: "in",
      amount: 650,
      orderId: "ord-0",
      title: "Commission cleared",
      createdAt: "2026-07-20T10:00:00.000Z",
    },
    {
      id: "txn-2",
      type: "penalty",
      direction: "out",
      amount: 100,
      orderId: "ord-1",
      title: "Return to vendor penalty",
      createdAt: "2026-08-01T10:00:00.000Z",
    },
    {
      id: "txn-3",
      type: "shipping-return",
      direction: "in",
      amount: 250,
      orderId: "ord-2",
      title: "Shipping & return claim (Defective item)",
      createdAt: "2026-08-05T10:00:00.000Z",
    },
  ],
  withdrawalRequests: [],
  simulatedDate: null,
  isSimulated: false,
  effectiveDate: "2026-08-30T10:00:00.000Z",
  deactivated: false,
  deactivationMessage: null,
  returnPenalty: 100,
  support: { email: "support@resello.pk", phone: "0300 1234567" },
  withdrawal: { allowedToday: false, weekday: "Monday", available: 450, nextWindow: null },
};

describe("WalletPage - Return Penalties vs Shipping & Return", () => {
  beforeEach(() => {
    vi.spyOn(client, "get").mockResolvedValue({ wallet: mockWallet });
  });

  it("renders both Return penalties and Shipping & Return payment with appropriate hints", async () => {
    render(
      <BrowserRouter>
        <WalletPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Shipping & Return payment")).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Returned to vendor/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Without commission/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("− Rs. 100")).toBeInTheDocument();
    expect(screen.getByText("Rs. 250")).toBeInTheDocument();
  });

  it("has distinct filter sections for Penalties and Shipping & Return in Transaction History", async () => {
    render(
      <BrowserRouter>
        <WalletPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Penalties" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Shipping & Return" })).toBeInTheDocument();
    });

    // Initially "All" shows all entries
    expect(screen.getByText("Commission cleared")).toBeInTheDocument();
    expect(screen.getByText("Return to vendor penalty")).toBeInTheDocument();
    expect(screen.getByText("Shipping & return claim (Defective item)")).toBeInTheDocument();

    // Click Penalties filter: only vendor return penalty visible
    fireEvent.click(screen.getByRole("button", { name: "Penalties" }));
    expect(screen.queryByText("Commission cleared")).not.toBeInTheDocument();
    expect(screen.queryByText("Shipping & return claim (Defective item)")).not.toBeInTheDocument();
    expect(screen.getByText("Return to vendor penalty")).toBeInTheDocument();

    // Click Shipping & Return filter: only reseller shipping & return claim visible
    fireEvent.click(screen.getByRole("button", { name: "Shipping & Return" }));
    expect(screen.queryByText("Commission cleared")).not.toBeInTheDocument();
    expect(screen.queryByText("Return to vendor penalty")).not.toBeInTheDocument();
    expect(screen.getByText("Shipping & return claim (Defective item)")).toBeInTheDocument();
  });
});
