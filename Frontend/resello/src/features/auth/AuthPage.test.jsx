import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import AuthPage from "./AuthPage";
import { AuthContext } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast/ToastContainer";

const renderSignup = (authOverrides = {}) => {
  const defaultAuth = {
    user: null,
    loading: false,
    isAuthenticated: false,
    signup: vi.fn().mockResolvedValue({ id: "u_1", name: "Fatima Ali" }),
    login: vi.fn(),
    logout: vi.fn(),
    ...authOverrides,
  };

  const utils = render(
    <AuthContext.Provider value={defaultAuth}>
      <ToastProvider>
        <BrowserRouter>
          <AuthPage mode="signup" />
        </BrowserRouter>
      </ToastProvider>
    </AuthContext.Provider>
  );

  return { ...utils, auth: defaultAuth };
};

describe("AuthPage Signup validation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Phone number label without optional badge", () => {
    renderSignup();

    const phoneLabel = screen.getByText(/^Phone number$/i);
    expect(phoneLabel).toBeInTheDocument();
    expect(screen.queryByText(/optional/i)).not.toBeInTheDocument();
  });

  it("rejects signup when phone number is missing", async () => {
    const user = userEvent.setup();
    const { auth } = renderSignup();

    await user.type(screen.getByLabelText(/Full name/i), "Fatima Ali");
    await user.type(screen.getByLabelText(/Email/i), "fatima@example.com");
    // Leave phone empty
    await user.type(screen.getByLabelText(/^Password/i), "SecurePassword123!");
    await user.type(screen.getByLabelText(/Confirm password/i), "SecurePassword123!");
    await user.click(screen.getByRole("checkbox", { name: /I agree/i }));

    await user.click(screen.getByRole("button", { name: /Create free account/i }));

    expect(screen.getByText("Enter your phone number.")).toBeInTheDocument();
    expect(auth.signup).not.toHaveBeenCalled();
  });

  it("rejects signup when phone number is not a valid Pakistani mobile number", async () => {
    const user = userEvent.setup();
    const { auth } = renderSignup();

    await user.type(screen.getByLabelText(/Full name/i), "Fatima Ali");
    await user.type(screen.getByLabelText(/Email/i), "fatima@example.com");
    await user.type(screen.getByLabelText(/Phone number/i), "12345"); // Invalid phone
    await user.type(screen.getByLabelText(/^Password/i), "SecurePassword123!");
    await user.type(screen.getByLabelText(/Confirm password/i), "SecurePassword123!");
    await user.click(screen.getByRole("checkbox", { name: /I agree/i }));

    await user.click(screen.getByRole("button", { name: /Create free account/i }));

    expect(
      screen.getByText("Use a Pakistani mobile number, like 0300 1234567.")
    ).toBeInTheDocument();
    expect(auth.signup).not.toHaveBeenCalled();
  });

  it("submits successfully when a valid Pakistani mobile number is provided", async () => {
    const user = userEvent.setup();
    const { auth } = renderSignup();

    await user.type(screen.getByLabelText(/Full name/i), "Fatima Ali");
    await user.type(screen.getByLabelText(/Email/i), "fatima@example.com");
    await user.type(screen.getByLabelText(/Phone number/i), "0300 1234567");
    await user.type(screen.getByLabelText(/^Password/i), "SecurePassword123!");
    await user.type(screen.getByLabelText(/Confirm password/i), "SecurePassword123!");
    await user.click(screen.getByRole("checkbox", { name: /I agree/i }));

    await user.click(screen.getByRole("button", { name: /Create free account/i }));

    expect(auth.signup).toHaveBeenCalledWith({
      name: "Fatima Ali",
      email: "fatima@example.com",
      phone: "0300 1234567",
      password: "SecurePassword123!",
    });
  });
});
