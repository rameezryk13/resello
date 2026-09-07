import { useEffect, useState } from "react";
import { get, post } from "@/api/client";
import endpoints from "@/api/endpoints";
import useWallet from "@/features/wallet/useWallet";
import { parsePrice } from "@/utils/currency";
import {
  formatCnic,
  formatIban,
  isValidCnic,
  isValidPakistanIban,
} from "@/utils/validation";
import { COD_TAX_RATE, EMPTY_ADDRESS, SHIPPING_CHARGE } from "../constants";

// Everything CheckoutPage knows how to do, minus the markup: loading the cart
// and address book, computing totals, and the three ways an order can be
// submitted. Extracted so the page component is a layout switch and the step
// components stay presentational.

const getItemProfitTotal = (item) => {
  const rawProfit = item?.profit;
  if (rawProfit !== undefined && rawProfit !== null && !Number.isNaN(Number(rawProfit))) {
    return Number(rawProfit);
  }

  const price = parsePrice(item?.product?.price);
  const original = parsePrice(item?.product?.originalPrice);
  return original > price ? Math.max(0, original - price) : 0;
};

const useCheckout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  // A mixed cart is split into one order per supplier server-side, so what
  // comes back is a list. placedOrders keeps the whole list for the receipt;
  // orderId stays as the first one for the single-order banner.
  const [placedOrders, setPlacedOrders] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState("address");
  const [orderPaymentType, setOrderPaymentType] = useState("cod");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentDetails, setPaymentDetails] = useState({
    bank: "",
    accountNumber: "",
    cnic: "",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  // A deactivated reseller can't place an order. The backend refuses it with a
  // 403 regardless — this is only so the page can say why up front instead of
  // letting someone fill in an address and a payment form for nothing.
  const { wallet } = useWallet();

  const loadCheckoutData = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const [cartData, addressData] = await Promise.all([
        get(endpoints.cart.root),
        get(endpoints.addresses),
      ]);

      setCartItems(cartData.cart || []);
      setAddresses(addressData.addresses || []);
      setSelectedAddressId((addressData.addresses || [])[0]?.id || "");
    } catch (err) {
      setError(err?.message || "Unable to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.product?.price) * item.quantity,
    0
  );

  const profitTotal = cartItems.reduce((sum, item) => sum + getItemProfitTotal(item), 0);

  // Shipping is added after tax is computed, so the flat rate is never taxed.
  // codTax is what COD *would* cost on this cart regardless of the current
  // selection — the advance-payment benefits quote it, so it has to stay
  // available even while advance is selected and the charge itself is waived.
  const codTax = Math.round((subtotal + profitTotal) * COD_TAX_RATE * 100) / 100;
  const tax = orderPaymentType === "cod" ? codTax : 0;
  const total = Math.round((subtotal + profitTotal + tax + SHIPPING_CHARGE) * 100) / 100;

  const handleNewAddressChange = (field, value) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  // The IBAN and CNIC fields re-format their own value on every keystroke, so
  // what's in state is always display-formatted.
  const handlePaymentChange = (field, value) => {
    const formattedValue =
      field === "accountNumber"
        ? formatIban(value)
        : field === "cnic"
          ? formatCnic(value)
          : value;

    setPaymentDetails((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setError(null);
    setMessage(null);
  };

  const submitNewAddress = async () => {
    const { name, line1, area, town, city, phone } = newAddress;
    if (!name || !line1 || !city || !phone) {
      setError("Please fill in all required address fields.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const combinedLine2 = [area, town].filter(Boolean).join(", ") || newAddress.line2 || "";

    try {
      const data = await post(endpoints.addresses, {
        ...newAddress,
        line2: combinedLine2,
      });

      const newAddressId = data.addresses?.[data.addresses.length - 1]?.id || "";
      setAddresses(data.addresses || []);
      setSelectedAddressId(newAddressId);
      setMessage("Address added successfully.");
      setShowAddressForm(false);
      setNewAddress(EMPTY_ADDRESS);
    } catch (err) {
      setError(err?.message || "Unable to add address");
    } finally {
      setSubmitting(false);
    }
  };

  const placeOrder = async (addressIdOverride) => {
    const addressId = addressIdOverride || selectedAddressId;
    if (!addressId || cartItems.length === 0) return;

    // Both entry points — Buy Now and the payment step — come through here, so
    // one check covers them.
    if (wallet.deactivated) {
      setError(wallet.deactivationMessage);
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const data = await post(endpoints.orders, {
        addressId,
        cart: cartItems,
        totalAmount: total,
        shippingCharge: SHIPPING_CHARGE,
        paymentType: orderPaymentType,
      });

      // Falls back to the single `order` field so an older API response, or a
      // test that mocks only that shape, still confirms.
      const orders = data.orders?.length ? data.orders : [data.order].filter(Boolean);

      setPlacedOrders(orders);
      setOrderId(orders[0]?.orderId || null);
      setCartItems([]);
      window.dispatchEvent(new CustomEvent("resello:cart-updated", { detail: { count: 0 } }));
      setCheckoutStep("confirm");
      setMessage(
        orders.length > 1
          ? `Order placed successfully. Your items ship from ${orders.length} suppliers, so they were placed as ${orders.length} separate orders.`
          : "Order placed successfully."
      );
    } catch (err) {
      setError(err?.message || "Unable to complete order");
    } finally {
      setSubmitting(false);
    }
  };

  // Buy Now (COD) places the order immediately and moves to the confirm step.
  // Pay Now (advance) moves to the payment step first — nothing is ordered
  // until the payment details clear validation.
  const handlePrimaryAction = () => {
    if (wallet.deactivated) {
      const email = wallet.support?.email || "support@resello.pk";
      setError(
        wallet.deactivationMessage ||
          `Your account is disabled because you have received 5 return penalties. You cannot place orders. Please contact admin at ${email}`
      );
      return;
    }

    if (!selectedAddressId) {
      setError("Please select a shipping address first.");
      return;
    }

    setError(null);
    setMessage(null);

    if (orderPaymentType === "cod") {
      placeOrder();
    } else {
      setCheckoutStep("payment");
    }
  };

  const handlePaymentSubmit = async () => {
    if (wallet.deactivated) {
      const email = wallet.support?.email || "support@resello.pk";
      setError(
        wallet.deactivationMessage ||
          `Your account is disabled because you have received 5 return penalties. You cannot place orders. Please contact admin at ${email}`
      );
      return;
    }

    if (!selectedAddressId) {
      setError("Please select a shipping address first.");
      setCheckoutStep("address");
      return;
    }

    if (paymentMethod === "bank") {
      const { bank, accountNumber, cnic } = paymentDetails;
      if (!bank || !accountNumber || !cnic) {
        setError("Please complete bank account payment details.");
        return;
      }

      if (!isValidPakistanIban(accountNumber)) {
        setError("Please enter a valid Pakistani IBAN, for example PK36 HABB 0000 0000 0000 0000.");
        return;
      }

      if (!isValidCnic(cnic)) {
        setError("Please enter CNIC in this format: 12345-1234567-1.");
        return;
      }
    }

    await placeOrder();
  };

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);

  return {
    // data
    cartItems,
    addresses,
    selectedAddress,
    selectedAddressId,
    orderId,
    placedOrders,
    wallet,
    // status
    loading,
    error,
    message,
    submitting,
    // totals
    subtotal,
    profitTotal,
    tax,
    codTax,
    total,
    getItemProfitTotal,
    // step state
    checkoutStep,
    setCheckoutStep,
    orderPaymentType,
    setOrderPaymentType,
    // address form
    showAddressForm,
    setShowAddressForm,
    newAddress,
    handleNewAddressChange,
    submitNewAddress,
    handleAddressSelect,
    // payment
    paymentMethod,
    setPaymentMethod,
    paymentDetails,
    handlePaymentChange,
    handlePaymentSubmit,
    handlePrimaryAction,
  };
};

export default useCheckout;
