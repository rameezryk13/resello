import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareModal from "./ShareModal";
import { AuthContext } from "@/context/AuthContext";

const mockAuth = {
  user: { name: "Test Reseller", shopName: "Resello Shop", phone: "+923001234567" },
  isAuthenticated: true,
};

const sampleProduct = {
  productId: "p123",
  name: "Test Novel Book",
  description: "A thrilling adventure novel set in ancient times.",
  category: "Books",
  sizes: ["Standard"],
  price: 1000,
  images: ["https://example.com/test1.jpg", "https://example.com/test2.jpg"],
};

const renderShareModal = (props = {}) => {
  return render(
    <AuthContext.Provider value={mockAuth}>
      <ShareModal
        open={true}
        onClose={vi.fn()}
        product={sampleProduct}
        {...props}
      />
    </AuthContext.Provider>
  );
};

describe("ShareModal (Orange Theme Pitch Studio)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders modal header, Orange theme class, and product title when open", () => {
    const { container } = renderShareModal();

    expect(screen.getByText("PITCH STUDIO")).toBeInTheDocument();
    expect(screen.getAllByText("Test Novel Book")[0]).toBeInTheDocument();
    expect(screen.getByText("LIVE PREVIEW")).toBeInTheDocument();
    expect(container.querySelector(".orange-theme")).toBeInTheDocument();
  });

  it("displays gallery picker when product has multiple images", async () => {
    const user = userEvent.setup();
    renderShareModal();

    expect(screen.getByText(/Select Picture for Share Card/i)).toBeInTheDocument();
    const thumbs = screen.getAllByRole("button", { name: /Thumbnail/i });
    expect(thumbs).toHaveLength(2);

    await user.click(thumbs[1]);
    expect(thumbs[1]).toHaveClass("active");
  });

  it("includes description and product details in text caption", () => {
    const { container } = renderShareModal();

    const textarea = container.querySelector(".pitch-studio-caption-textarea");
    expect(textarea.value).toContain("A thrilling adventure novel set in ancient times.");
    expect(textarea.value).toContain("Category: Books");
    expect(textarea.value).toContain("Available Sizes: Standard");
  });

  it("displays only the unified Share button without removed extra action buttons", () => {
    renderShareModal();

    expect(screen.getByRole("button", { name: /^Share$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Share All Pictures/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Share Sheet/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Copy Card/i })).not.toBeInTheDocument();
  });

  it("calculates selling price based on profit presets", async () => {
    const user = userEvent.setup();
    renderShareModal();

    // Default +30% preset on base price 1000 => 1300
    expect(screen.getByDisplayValue("1300")).toBeInTheDocument();

    // Click +50% preset => base price 1000 * 1.5 = 1500
    const btn50 = screen.getByRole("button", { name: "+50%" });
    await user.click(btn50);

    expect(screen.getByDisplayValue("1500")).toBeInTheDocument();
    expect(screen.getByText("PKR 500")).toBeInTheDocument(); // Earnings
  });

  it("updates live preview badge when selling price is typed manually", async () => {
    const user = userEvent.setup();
    renderShareModal();

    const priceInput = screen.getByDisplayValue("1300");
    await user.clear(priceInput);
    await user.type(priceInput, "2000");

    expect(screen.getByText("PKR 2,000")).toBeInTheDocument();
  });

  it("calls onClose when close button is pressed", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    renderShareModal({ onClose: handleClose });

    const closeBtn = screen.getByRole("button", { name: "Close modal" });
    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
