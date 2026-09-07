import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ContactPage from "./ContactPage";
import * as client from "@/api/client";

vi.mock("@/components/layout/Header/Header", () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock("@/context/ToastContext", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("ContactPage render and interaction tests", () => {
  beforeEach(() => {
    vi.spyOn(client, "get").mockResolvedValue({ issues: [] });
    vi.spyOn(client, "post").mockResolvedValue({
      issue: {
        id: "ISS-999001",
        issueType: "Delivery Issues",
        description: "Package was delayed for three days please help",
        attachments: [],
        status: "active",
        createdAt: new Date().toISOString(),
        adminReply: null,
      },
    });
  });

  it("renders ContactPage without errors", async () => {
    render(
      <BrowserRouter>
        <ContactPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Contact & Customer Support Center/i)).toBeInTheDocument();
    expect(screen.getByText(/New Request/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Issues/i)).toBeInTheDocument();
    expect(screen.getByText(/Resolved Issues/i)).toBeInTheDocument();
  });

  it("can switch tabs between New Request, Active Issues, and Resolved Issues without crashing", async () => {
    render(
      <BrowserRouter>
        <ContactPage />
      </BrowserRouter>
    );

    // Switch to Active Issues
    const activeTab = screen.getByRole("button", { name: /Active Issues/i });
    fireEvent.click(activeTab);
    expect(screen.getByText(/Active \/ Under Review/i)).toBeInTheDocument();

    // Switch to Resolved Issues
    const resolvedTab = screen.getByRole("button", { name: /Resolved Issues/i });
    fireEvent.click(resolvedTab);
    expect(screen.getAllByText(/Solved/i).length).toBeGreaterThanOrEqual(1);

    // Switch back to New Request
    const newTab = screen.getByRole("button", { name: /New Request/i });
    fireEvent.click(newTab);
    expect(screen.getByText(/Submit a Support Request/i)).toBeInTheDocument();
  });

  it("submits a support request and displays it in active issues", async () => {
    render(
      <BrowserRouter>
        <ContactPage />
      </BrowserRouter>
    );

    const textarea = screen.getByPlaceholderText(/Describe your issue clearly/i);
    fireEvent.change(textarea, {
      target: { value: "My order has not arrived yet for five whole days" },
    });

    const submitBtn = screen.getByRole("button", { name: /Submit Support Request/i });
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/ISS-/).length).toBeGreaterThanOrEqual(1);
    });
  });
});
