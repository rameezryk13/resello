import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Header from "../../../components/Header/Header.jsx";
import AddressStep from "./components/AddressStep/AddressStep";
import ConfirmStep from "./components/ConfirmStep/ConfirmStep";
import OrderSummaryCard from "./components/OrderSummaryCard/OrderSummaryCard";
import PaymentStep from "./components/PaymentStep/PaymentStep";
import useCheckout from "./hooks/useCheckout";
import "./CheckoutPage.css";

const STEP_LABELS = ["Address", "Payment", "Confirm"];
const STEP_INDEX = { address: 0, payment: 1, confirm: 2 };

const CheckoutPage = () => {
  const navigate = useNavigate();
  const checkout = useCheckout();

  const {
    cartItems,
    addresses,
    selectedAddress,
    selectedAddressId,
    orderId,
    loading,
    error,
    message,
    submitting,
    subtotal,
    profitTotal,
    tax,
    codTax,
    total,
    getItemProfitTotal,
    checkoutStep,
    setCheckoutStep,
    orderPaymentType,
    setOrderPaymentType,
    showAddressForm,
    setShowAddressForm,
    newAddress,
    handleNewAddressChange,
    submitNewAddress,
    handleAddressSelect,
    paymentMethod,
    setPaymentMethod,
    paymentDetails,
    handlePaymentChange,
    handlePaymentSubmit,
    handlePrimaryAction,
  } = checkout;

  const activeStepIndex = STEP_INDEX[checkoutStep] ?? 0;

  if (loading) {
    return (
      <div className="checkout-page">
        <Header />
        <div className="container checkout-loading">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="checkout-page animate-fade-in">
      <Header />
      <div className="container checkout-content">
        <div className="checkout-header-row">
          <div>
            <h2>Checkout</h2>
            <p>Select an address and confirm your order.</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => navigate("/cart")}>
            Back to Cart
          </button>
        </div>

        {error ? <div className="checkout-error">{error}</div> : null}
        {message ? <div className="checkout-message success">{message}</div> : null}
        {orderId ? <div className="checkout-message info">Order ID: {orderId}</div> : null}

        <div className="checkout-stepper" aria-label="Checkout progress">
          {STEP_LABELS.map((step, index) => {
            const isComplete = activeStepIndex > index;
            const isActive = activeStepIndex === index;
            return (
              <div
                className={`checkout-step ${isComplete ? "complete" : ""} ${isActive ? "active" : ""}`}
                key={step}
              >
                <span>{isComplete ? <Check size={16} aria-hidden="true" /> : index + 1}</span>
                <strong>{step}</strong>
              </div>
            );
          })}
        </div>

        {checkoutStep === "address" ? (
          <div className="checkout-grid">
            <AddressStep
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onAddressSelect={handleAddressSelect}
              showAddressForm={showAddressForm}
              setShowAddressForm={setShowAddressForm}
              newAddress={newAddress}
              onNewAddressChange={handleNewAddressChange}
              onSubmitNewAddress={submitNewAddress}
              submitting={submitting}
              orderPaymentType={orderPaymentType}
              setOrderPaymentType={setOrderPaymentType}
              codTax={codTax}
            />
            <OrderSummaryCard
              cartItems={cartItems}
              orderId={orderId}
              subtotal={subtotal}
              profitTotal={profitTotal}
              tax={tax}
              total={total}
              getItemProfitTotal={getItemProfitTotal}
              orderPaymentType={orderPaymentType}
              submitting={submitting}
              selectedAddressId={selectedAddressId}
              onPrimaryAction={handlePrimaryAction}
            />
          </div>
        ) : null}

        {checkoutStep === "payment" ? (
          <PaymentStep
            cartItems={cartItems}
            orderId={orderId}
            total={total}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentDetails={paymentDetails}
            onPaymentChange={handlePaymentChange}
            onPaymentSubmit={handlePaymentSubmit}
            onBack={() => setCheckoutStep("address")}
            submitting={submitting}
          />
        ) : null}

        {checkoutStep === "confirm" ? (
          <ConfirmStep
            orderId={orderId}
            selectedAddress={selectedAddress}
            onViewOrders={() => navigate("/orders")}
          />
        ) : null}
      </div>
    </div>
  );
};

export default CheckoutPage;
