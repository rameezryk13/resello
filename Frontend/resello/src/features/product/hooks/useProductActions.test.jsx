import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useProductActions from "./useProductActions";
import * as client from "@/api/client";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

let mockAuthUser = null;
let mockIsAuthenticated = true;
let mockBlocked = vi.fn(() => false);

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

vi.mock("@/features/auth/useAuthGate", () => ({
  default: () => ({
    isAuthenticated: mockIsAuthenticated,
    blocked: mockBlocked,
  }),
}));

vi.mock("@/features/wallet/useWallet", () => ({
  default: () => ({ wallet: {} }),
}));

describe("useProductActions handleBuyNow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBlocked = vi.fn(() => false);
    mockAuthUser = null;
    mockIsAuthenticated = true;
    window.scrollTo = vi.fn();
  });

  it("takes user to top and dispatches resello:blink-verification-banner when user is under verification", async () => {
    mockAuthUser = { id: "u1", name: "Test User", isVerified: false, isUnderVerification: true };

    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    const { result } = renderHook(() =>
      useProductActions({
        product: { productId: "RS123", name: "Suit", price: 199 },
        images: ["/suit.jpg"],
        quantity: 1,
        selectedSize: "M",
        selectedColor: "Navy",
        profitValue: 50,
        hasVariantStock: false,
        currentVariantStock: 10,
      })
    );

    await act(async () => {
      await result.current.handleBuyNow();
    });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "resello:blink-verification-banner" })
    );
    expect(result.current.actionError).toMatch(/Your account is under verification/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("proceeds to cart/checkout and does not blink banner when user is verified", async () => {
    mockAuthUser = { id: "u1", name: "Test User", isVerified: true, isUnderVerification: false };
    vi.spyOn(client, "post").mockResolvedValue({ success: true });

    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    const { result } = renderHook(() =>
      useProductActions({
        product: { productId: "RS123", name: "Suit", price: 199 },
        images: ["/suit.jpg"],
        quantity: 1,
        selectedSize: "M",
        selectedColor: "Navy",
        profitValue: 50,
        hasVariantStock: false,
        currentVariantStock: 10,
      })
    );

    await act(async () => {
      await result.current.handleBuyNow();
    });

    expect(result.current.actionError).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/checkout");
    const blinkEvents = dispatchEventSpy.mock.calls.filter(
      (c) => c[0]?.type === "resello:blink-verification-banner"
    );
    expect(blinkEvents.length).toBe(0);
  });
});
