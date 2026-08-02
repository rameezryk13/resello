import { CreditCard, Landmark, WalletCards } from "lucide-react";

// Values shared across the checkout step components. They live here rather
// than in CheckoutPage.jsx so a step component can import what it needs
// without pulling in the page.

// Flat rate. Deliberately excluded from the taxable base — see useCheckout.
export const SHIPPING_CHARGE = 5.99;

// Charged on cash-on-delivery orders only; advance payment is exempt, which is
// the main reason a shopper would choose it. Applied to subtotal + profit,
// never to shipping — see useCheckout.
export const COD_TAX_RATE = 0.04;

// Shown under the payment options when advance is selected. The first entry is
// filled in with the actual amount the shopper avoids, so the claim is backed
// by the same number the summary would have charged.
export const ADVANCE_PAYMENT_BENEFITS = [
  "No 4% cash-on-delivery tax",
  "Order is dispatched as soon as payment clears",
  "Nothing to hand over at the door — no exact change needed",
];

export const DELIVERY_PARTNER = {
  name: "TCS",
  description: "Trusted nationwide courier · delivers in 2-4 business days",
};

export const PAYMENT_METHODS = [
  { id: "card", label: "Credit & Debit Card", icon: CreditCard },
  { id: "wallet", label: "Mobile Wallet", icon: WalletCards },
  { id: "bank", label: "Bank Account", icon: Landmark },
];

export const BANKS = ["HBL", "UBL", "Meezan Bank", "Bank Alfalah", "MCB"];

// Both the initial state of the new-address form and what it resets to after
// a successful save, so the two can't drift apart.
export const EMPTY_ADDRESS = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  postalCode: "",
  country: "Pakistan",
  phone: "",
};
