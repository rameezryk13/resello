import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import IBANInput from "./IBANInput";

describe("IBANInput Component", () => {
  it("renders with placeholder and format hint", () => {
    render(
      <IBANInput
        id="test-iban"
        label="Bank Account IBAN"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Bank Account IBAN/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("PK00 XXXX 0000 0000 0000 0000")).toBeInTheDocument();
    expect(
      screen.getByText(/Format: PK \+ 2 check digits \+ 4-letter bank code \+ 16 digits/i)
    ).toBeInTheDocument();
  });

  it("automatically ensures PK prefix and formats input in 4-character blocks", () => {
    const handleChange = vi.fn();
    render(
      <IBANInput
        id="test-iban"
        label="Bank Account IBAN"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(/Bank Account IBAN/i);
    fireEvent.change(input, { target: { value: "36MEZN0000" } });

    // It should prepend PK and format as "PK36 MEZN 0000"
    expect(handleChange).toHaveBeenCalledWith("PK36 MEZN 0000");
  });

  it("shows bank alert when characters 5–8 are not letters", () => {
    const handleChange = vi.fn();
    render(
      <IBANInput
        id="test-iban"
        label="Bank Account IBAN"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(/Bank Account IBAN/i);
    fireEvent.change(input, { target: { value: "PK361234" } });

    expect(
      screen.getByText("Characters 5–8 must be letters (bank code, e.g. HABB)")
    ).toBeInTheDocument();
  });

  it("shows error validation message when error prop is provided", () => {
    render(
      <IBANInput
        id="test-iban"
        label="Bank Account IBAN"
        value="PK36 MEZN"
        error="Invalid IBAN"
        onChange={vi.fn()}
      />
    );

    expect(
      screen.getByText("IBAN must be: PK00 XXXX 0000 0000 0000 0000")
    ).toBeInTheDocument();
  });
});
