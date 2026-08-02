import { describe, it, expect } from "vitest";
import { formatRupees, formatProductPrice } from "./currency";

// These functions run on every price the app renders, and they're written
// defensively because the backend sends prices as strings, numbers, and
// occasionally strings with commas already in them. The tests below pin that
// tolerance down so a future "cleanup" doesn't quietly narrow it.

describe("formatRupees", () => {
  it("formats a plain number", () => {
    expect(formatRupees(1500)).toBe("Rs. 1,500");
  });

  it("formats a numeric string", () => {
    expect(formatRupees("1500")).toBe("Rs. 1,500");
  });

  it("strips commas already present in the input", () => {
    // Without the comma-stripping, "1,500" would parse as 1 and the user
    // would be shown Rs. 1 for a Rs. 1,500 product.
    expect(formatRupees("1,500")).toBe("Rs. 1,500");
    expect(formatRupees("1,234,567")).toBe("Rs. 1,234,567");
  });

  it("pulls the number out of a string with a currency prefix", () => {
    expect(formatRupees("Rs. 2,000")).toBe("Rs. 2,000");
  });

  it("keeps decimals up to two places by default", () => {
    expect(formatRupees(1500.5)).toBe("Rs. 1,500.5");
    expect(formatRupees(1500.567)).toBe("Rs. 1,500.57");
  });

  it("respects an explicit maximumFractionDigits", () => {
    expect(formatRupees(1500.567, 0)).toBe("Rs. 1,501");
  });

  it("handles negative values", () => {
    expect(formatRupees(-250)).toBe("Rs. -250");
  });

  it("falls back to zero for values with no number in them", () => {
    expect(formatRupees(undefined)).toBe("Rs. 0");
    expect(formatRupees(null)).toBe("Rs. 0");
    expect(formatRupees("")).toBe("Rs. 0");
    expect(formatRupees("N/A")).toBe("Rs. 0");
  });
});

describe("formatProductPrice", () => {
  it("formats a real price like formatRupees does", () => {
    expect(formatProductPrice(1500)).toBe("Rs. 1,500");
  });

  it("returns an empty string for a missing price", () => {
    // Distinct from formatRupees on purpose: a product with no price should
    // render nothing, not "Rs. 0", which reads as free.
    expect(formatProductPrice(undefined)).toBe("");
    expect(formatProductPrice(null)).toBe("");
    expect(formatProductPrice("")).toBe("");
  });

  it("still formats a genuine zero", () => {
    expect(formatProductPrice(0)).toBe("Rs. 0");
  });
});
