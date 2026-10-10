import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PhoneInput, { isPhoneValid } from "./PhoneInput";

describe("PhoneInput Component", () => {
  it("renders with placeholder and defaults value to +92 3", () => {
    render(
      <PhoneInput
        id="phone-test"
        label="Phone Number"
        value=""
        onChange={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/Phone Number/i);
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("+92 3");
    expect(screen.getByPlaceholderText("+92 3xx xxxxxxx")).toBeInTheDocument();
  });

  it("automatically enforces +92 3 prefix and extracts up to 10 digits", () => {
    const handleChange = vi.fn();
    render(
      <PhoneInput
        id="phone-test"
        label="Phone Number"
        value="+92 3"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(input, { target: { value: "+92 300123456789" } });

    // Should slice to 10 digits starting with 3
    expect(handleChange).toHaveBeenCalledWith("+92 3001234567");
  });

  it("handles input without +92 prefix and removes leading 0", () => {
    const handleChange = vi.fn();
    render(
      <PhoneInput
        id="phone-test"
        label="Phone Number"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(input, { target: { value: "03001234567" } });

    expect(handleChange).toHaveBeenCalledWith("+92 3001234567");
  });

  it("displays missing validation message when error is set and length <= 3", () => {
    render(
      <PhoneInput
        id="phone-test"
        label="Mobile Number"
        value="+92 3"
        error={true}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Mobile Number is required")).toBeInTheDocument();
  });

  it("displays digits needed validation message when incomplete", () => {
    render(
      <PhoneInput
        id="phone-test"
        label="Mobile Number"
        value="+92300" // 3 digits entered, 7 more needed
        error={true}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("7 more digits needed")).toBeInTheDocument();
  });

  it("isPhoneValid utility validates Pakistani mobile numbers correctly", () => {
    expect(isPhoneValid("+923001234567")).toBe(true);
    expect(isPhoneValid("+923339876543")).toBe(true);
    expect(isPhoneValid("+921234567890")).toBe(false); // Doesn't start with 3
    expect(isPhoneValid("+92300")).toBe(false); // Too short
    expect(isPhoneValid("")).toBe(false);
  });
});
