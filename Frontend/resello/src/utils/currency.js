// Pulls a number out of whatever the backend sent. Prices arrive as numbers,
// as plain strings, as "1,500", and as "Rs. 1,500" depending on the endpoint,
// so every consumer needs this before doing arithmetic.
//
// Exported as parsePrice because CartPage, CheckoutPage and OrdersPage each
// had their own byte-identical copy of it.
export const parsePrice = (value) => {
  const cleaned = String(value ?? "").replace(/,/g, "");
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

export const formatRupees = (value, maximumFractionDigits = 2) =>
  `Rs. ${parsePrice(value).toLocaleString("en-PK", { maximumFractionDigits })}`;

// A wallet balance can go negative once return penalties outrun commission, and
// formatRupees renders that as "Rs. -250" — the sign buried inside the amount.
// Money in minus reads better with the sign in front of the whole figure.
export const formatSignedRupees = (value, maximumFractionDigits = 2) => {
  const amount = parsePrice(value);
  return amount < 0
    ? `− ${formatRupees(Math.abs(amount), maximumFractionDigits)}`
    : formatRupees(amount, maximumFractionDigits);
};

export const formatProductPrice = (value) =>
  value === undefined || value === null || value === "" ? "" : formatRupees(value);
