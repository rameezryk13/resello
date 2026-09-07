import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header.jsx";
import * as client from "@/api/client";
import { AuthContext } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast/ToastContainer";
import { signedInAuth, signedOutAuth } from "@/test/authFixtures";

// The desktop bell and the mobile menu entry are both in the DOM at once
// (only CSS hides one), so every query here is scoped to one of them.
// Notifications belong to an account, so these tests render the signed-in
// header; the signed-out swap is asserted separately at the bottom.
const renderHeader = (auth = signedInAuth()) => {
  // SearchBar requests products on input. Nothing here types into it; the stub
  // just keeps an unmocked fetch out of the test.
  vi.spyOn(client, "get").mockResolvedValue([]);

  const { container } = render(
    <AuthContext.Provider value={auth}>
      <ToastProvider>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </ToastProvider>
    </AuthContext.Provider>
  );

  return {
    desktop: within(container.querySelector(".nav-icons")),
    mobile: within(container.querySelector(".mobile-action-menu")),
  };
};

const bellLabel = () =>
  document.querySelector(".nav-icons .notif-bell-wrap").getAttribute("aria-label");

const panel = () => screen.getByRole("dialog", { name: "Notifications" });

describe("Header notifications", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("counts the unread notifications on the bell and opens no panel until clicked", () => {
    renderHeader();

    expect(bellLabel()).toBe("Notifications, 3 unread");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the panel with the sample notifications when the bell is clicked", async () => {
    const user = userEvent.setup();
    const { desktop } = renderHeader();

    await user.click(desktop.getByRole("button", { name: /^Notifications/ }));

    const dialog = within(panel());
    expect(dialog.getByText("Eid Sale is live")).toBeInTheDocument();
    expect(dialog.getByText("Order has been placed")).toBeInTheDocument();
    expect(dialog.getByText("Order shipped")).toBeInTheDocument();
    expect(dialog.getByText("Profit credited")).toBeInTheDocument();
    expect(dialog.getByText("3 new")).toBeInTheDocument();
  });

  it("opens the same panel from the mobile menu", async () => {
    const user = userEvent.setup();
    const { mobile } = renderHeader();

    await user.click(mobile.getByRole("button", { name: /^Notifications/ }));

    expect(within(panel()).getByText("Eid Sale is live")).toBeInTheDocument();
  });

  it("clears the badge and the unread markers when all are marked read", async () => {
    const user = userEvent.setup();
    const { desktop } = renderHeader();

    await user.click(desktop.getByRole("button", { name: /^Notifications/ }));
    await user.click(within(panel()).getByRole("button", { name: /Mark all as read/i }));

    expect(within(panel()).queryByText("3 new")).not.toBeInTheDocument();
    expect(within(panel()).queryByRole("button", { name: /Mark all as read/i })).not.toBeInTheDocument();
    expect(bellLabel()).toBe("Notifications");
    // The feed itself stays: marking read is not dismissing.
    expect(within(panel()).getByText("Eid Sale is live")).toBeInTheDocument();
  });

  it("closes the panel on the close button and on Escape", async () => {
    const user = userEvent.setup();
    const { desktop } = renderHeader();
    const openBell = desktop.getByRole("button", { name: /^Notifications/ });

    await user.click(openBell);
    await user.click(screen.getByRole("button", { name: "Close notifications" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(openBell);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves focus into the panel on open and back to the bell on close", async () => {
    const user = userEvent.setup();
    const { desktop } = renderHeader();
    const openBell = desktop.getByRole("button", { name: /^Notifications/ });

    await user.click(openBell);
    expect(screen.getByRole("button", { name: "Close notifications" })).toHaveFocus();

    await user.keyboard("{Escape}");
    // Closing must not drop focus to <body>, or a keyboard user restarts their
    // tab from the top of the page.
    expect(openBell).toHaveFocus();
  });
});

describe("Header account state", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("offers one Log in button instead of Alerts and Account to a visitor", () => {
    const { desktop, mobile } = renderHeader(signedOutAuth());

    expect(desktop.getByRole("button", { name: /Log in/i })).toBeInTheDocument();
    expect(desktop.queryByRole("button", { name: /^Notifications/ })).not.toBeInTheDocument();
    expect(desktop.queryByRole("button", { name: /^Account/ })).not.toBeInTheDocument();
    expect(mobile.getByRole("button", { name: /Log in/i })).toBeInTheDocument();
    expect(mobile.queryByRole("button", { name: /Log out/i })).not.toBeInTheDocument();
  });

  it("names the signed-in reseller on the account button and offers Log out", () => {
    const { desktop, mobile } = renderHeader();

    // First name only: the button is 40px tall and "Ayesha" is what identifies
    // the session to its owner.
    expect(desktop.getByRole("button", { name: "Account, signed in as Ayesha Malik" }))
      .toHaveTextContent("Ayesha");
    expect(desktop.queryByRole("button", { name: /Log in/i })).not.toBeInTheDocument();
    expect(mobile.getByRole("button", { name: /Log out/i })).toBeInTheDocument();
  });

  it("keeps Favorites and Cart visible to a visitor so the aisle stays open", () => {
    const { desktop } = renderHeader(signedOutAuth());

    // They're gated on click rather than hidden — a visitor should still see
    // that a cart exists.
    expect(desktop.getByRole("button", { name: "Favorites" })).toBeInTheDocument();
    expect(desktop.getByRole("button", { name: "Cart" })).toBeInTheDocument();
  });

  it("ends the session and leaves for home when Log out is clicked", async () => {
    const user = userEvent.setup();
    const auth = signedInAuth();
    const { desktop } = renderHeader(auth);

    await user.click(desktop.getByRole("button", { name: /^Account/ }));
    await user.click(desktop.getByRole("button", { name: "Log out" }));

    expect(auth.logout).toHaveBeenCalledOnce();
  });
});
