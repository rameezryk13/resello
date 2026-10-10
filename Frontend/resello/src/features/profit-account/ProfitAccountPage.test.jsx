import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProfitAccountPage from "./ProfitAccountPage";
import * as AuthContext from "@/context/AuthContext";
import * as ToastContext from "@/context/ToastContext";

vi.mock("@/components/layout/Header/Header.jsx", () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

describe("ProfitAccountPage - Two Options: Smart Wallet & Bank Account", () => {
  let mockUpdateProfile;
  let mockToast;

  beforeEach(() => {
    mockUpdateProfile = vi.fn().mockResolvedValue({});
    mockToast = {
      success: vi.fn(),
      error: vi.fn(),
    };

    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      user: { id: "user-1", email: "test@resello.pk", bankInfo: null },
      updateProfile: mockUpdateProfile,
    });

    vi.spyOn(ToastContext, "useToast").mockReturnValue(mockToast);
  });

  it("renders only two payment options: Smart Wallet and Bank Account", () => {
    render(
      <BrowserRouter>
        <ProfitAccountPage />
      </BrowserRouter>
    );

    // Open setup options
    const setupBtn = screen.getByRole("button", { name: /Setup Profit Account/i });
    fireEvent.click(setupBtn);

    // There should only be two payment option buttons
    const smartWalletOption = screen.getByRole("button", { name: /Smart Wallet/i });
    const bankAccountOption = screen.getByRole("button", { name: /Bank Account/i });

    expect(smartWalletOption).toBeInTheDocument();
    expect(bankAccountOption).toBeInTheDocument();

    // Verify there are no standalone old separate JazzCash/EasyPaisa top-level buttons
    expect(screen.queryByRole("button", { name: /^JazzCash$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^EasyPaisa$/i })).not.toBeInTheDocument();
  });

  it("provides smart wallet providers and validates mobile number for Smart Wallet option", async () => {
    render(
      <BrowserRouter>
        <ProfitAccountPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Setup Profit Account/i }));

    // Smart wallet is default or click it
    const smartWalletOption = screen.getByRole("button", { name: /Smart Wallet/i });
    fireEvent.click(smartWalletOption);

    // Check label for mobile number
    expect(screen.getByLabelText(/Registered Mobile Number/i)).toBeInTheDocument();

    // Check smart wallet provider select options
    const providerSelect = screen.getByLabelText(/Select Smart Wallet Provider/i);
    expect(providerSelect).toBeInTheDocument();

    const options = Array.from(providerSelect.querySelectorAll("option")).map((o) => o.value);
    expect(options).toContain("JazzCash");
    expect(options).toContain("EasyPaisa");
    expect(options).toContain("SadaPay");
    expect(options).toContain("NayaPay");
    expect(options).toContain("UPaisa");

    // Enter account title and an invalid phone number
    fireEvent.change(screen.getByLabelText(/Wallet Holder Name/i), {
      target: { value: "Ayesha Khan" },
    });
    fireEvent.change(screen.getByLabelText(/Registered Mobile Number/i), {
      target: { value: "12345" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save & Lock Profit Account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/more digits? needed/i)
      ).toBeInTheDocument();
    });

    // Enter valid Pakistani mobile number
    fireEvent.change(screen.getByLabelText(/Registered Mobile Number/i), {
      target: { value: "0300 1234567" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save & Lock Profit Account/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        bankInfo: expect.objectContaining({
          methodType: "smart_wallet",
          accountTitle: "Ayesha Khan",
          accountNumber: "+923001234567",
        }),
      });
    });
  });

  it("provides all banks including smart wallets and validates IBAN for Bank Account option", async () => {
    render(
      <BrowserRouter>
        <ProfitAccountPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Setup Profit Account/i }));

    // Switch to Bank Account
    const bankAccountOption = screen.getByRole("button", { name: /Bank Account/i });
    fireEvent.click(bankAccountOption);

    // Check label for IBAN
    expect(screen.getByLabelText(/24-character Pakistani IBAN/i)).toBeInTheDocument();

    // Check bank dropdown contains commercial banks AND smart wallets/EMIs with IBAN
    const bankSelect = screen.getByLabelText(/Select Bank \/ Financial Institution/i);
    const bankOptions = Array.from(bankSelect.querySelectorAll("option")).map((o) => o.value);

    expect(bankOptions).toContain("Meezan Bank");
    expect(bankOptions).toContain("HBL (Habib Bank Limited)");
    expect(bankOptions).toContain("SadaPay (SadaTech / Microfinance IBAN)");
    expect(bankOptions).toContain("NayaPay (NayaPay EMI IBAN)");
    expect(bankOptions).toContain("JazzCash (Mobilink Microfinance Bank IBAN)");
    expect(bankOptions).toContain("EasyPaisa (Telenor Microfinance Bank IBAN)");

    // Enter title and invalid IBAN (too short)
    fireEvent.change(screen.getByLabelText(/Bank Holder Name/i), {
      target: { value: "Ali Raza" },
    });
    fireEvent.change(screen.getByLabelText(/24-character Pakistani IBAN/i), {
      target: { value: "PK12345" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save & Lock Profit Account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/IBAN must be: PK00 XXXX 0000 0000 0000 0000/i)
      ).toBeInTheDocument();
    });

    // Test characters 5-8 must be letters bank alert
    fireEvent.change(screen.getByLabelText(/24-character Pakistani IBAN/i), {
      target: { value: "PK3612340000000123456701" },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Characters 5–8 must be letters/i)
      ).toBeInTheDocument();
    });

    // Enter valid 24-char Pakistani IBAN
    fireEvent.change(screen.getByLabelText(/24-character Pakistani IBAN/i), {
      target: { value: "PK36MEZN0000000123456701" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save & Lock Profit Account/i }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        bankInfo: expect.objectContaining({
          methodType: "bank_account",
          accountTitle: "Ali Raza",
          accountNumber: "PK36 MEZN 0000 0001 2345 6701",
        }),
      });
    });
  });
});
