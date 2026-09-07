import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import DashboardPage from "./DashboardPage";
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
  penalties: [],
  transactions: [],
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

describe("DashboardPage - Separate Return penalties & Shipping & return payment", () => {
  beforeEach(() => {
    vi.spyOn(client, "get").mockImplementation((url) => {
      if (url.includes("/wallet")) {
        return Promise.resolve({ wallet: mockWallet });
      }
      if (url.includes("/profit-summary")) {
        return Promise.resolve({
          totals: { ordersCount: 5, itemsSold: 8, totalProfit: 1200 },
        });
      }
      if (url.includes("/followed-shops")) {
        return Promise.resolve({ followedShops: [] });
      }
      return Promise.resolve({});
    });
  });

  it("renders both Return penalties and Shipping & return payment in dashboard metrics rail", async () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Return penalties/i)).toBeInTheDocument();
      expect(screen.getByText(/Shipping & return payment/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Returned to vendor/i)).toBeInTheDocument();
    expect(screen.getByText(/Without commission/i)).toBeInTheDocument();
    expect(screen.getByText("− Rs. 100")).toBeInTheDocument();
    expect(screen.getByText("Rs. 250")).toBeInTheDocument();
  });
});
