// Input formatters and validators for the checkout payment form.
//
// These live here rather than inside CheckoutPage because they're pure string
// functions with no React involvement, and because getting them wrong rejects
// a real customer's real bank details — which is worth testing directly
// instead of through the form.

// Pakistani IBANs are 24 characters. Grouping them in fours is how banks
// print them, and it's the only way a user can proofread what they typed.
export const formatIban = (value) => {
  const compact = String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
  return compact.replace(/(.{4})/g, "$1 ").trim();
};

export const normalizeIban = (value) =>
  String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

// PK + 2 check digits + 4-letter bank code + 16 alphanumeric account chars.
export const isValidPakistanIban = (value) =>
  /^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(normalizeIban(value));

// CNIC is 13 digits shown as 12345-1234567-1.
export const formatCnic = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const isValidCnic = (value) => /^\d{5}-\d{7}-\d$/.test(String(value ?? ""));
