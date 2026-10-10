import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { routeConfig } from "./routeConfig";
import AppRoutes from "./AppRoutes";
import * as AuthContext from "@/context/AuthContext";
import * as client from "@/api/client";

vi.mock("@/components/layout/Header/Header.jsx", () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock("@/components/layout/Header/Header", () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

describe("routeConfig and page routing", () => {
  it("includes /checkout route with protection", () => {
    const checkoutRoute = routeConfig.find((r) => r.path === "/checkout");
    expect(checkoutRoute).toBeDefined();
    expect(checkoutRoute.protected).toBe(true);
  });

  it("includes /my-orders and /orders routes with protection", () => {
    const myOrdersRoute = routeConfig.find((r) => r.path === "/my-orders");
    const ordersRoute = routeConfig.find((r) => r.path === "/orders");
    expect(myOrdersRoute).toBeDefined();
    expect(myOrdersRoute.protected).toBe(true);
    expect(ordersRoute).toBeDefined();
    expect(ordersRoute.protected).toBe(true);
  });

  it("has valid components for every defined route", () => {
    routeConfig.forEach((route) => {
      expect(route.path).toBeDefined();
      expect(route.Component).toBeDefined();
    });
  });

  it("loads the CheckoutPage when navigating to /checkout for authenticated user", async () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: "user-1", name: "Rameez", email: "rameez@example.com" },
    });

    vi.spyOn(client, "get").mockImplementation((url) => {
      if (url.includes("/cart")) {
        return Promise.resolve({
          cart: [
            {
              itemId: "item-1",
              quantity: 1,
              profit: 200,
              product: { id: "prod-1", name: "Sample Item", price: 1000 },
            },
          ],
        });
      }
      if (url.includes("/addresses")) {
        return Promise.resolve({
          addresses: [
            {
              id: "addr-1",
              name: "Rameez",
              line1: "Main St",
              city: "Lahore",
              phone: "03001234567",
            },
          ],
        });
      }
      if (url.includes("/wallet")) {
        return Promise.resolve({
          wallet: {
            balance: 5000,
            pendingCommission: 0,
            deactivated: false,
          },
        });
      }
      return Promise.resolve({});
    });

    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Should load the checkout page step or summary, not 404
    await waitFor(() => {
      expect(screen.queryByText("404 - Page Not Found")).not.toBeInTheDocument();
      expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
    });
  });

  it("loads public pages without 404", async () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
    });

    const publicPaths = ["/about", "/contact", "/faq", "/shipping-policy", "/terms", "/privacy"];

    for (const path of publicPaths) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText("404 - Page Not Found")).not.toBeInTheDocument();
      });

      unmount();
    }
  });
});
