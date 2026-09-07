import { useCallback, useEffect, useState } from "react";
import { get, post } from "@/api/client";
import endpoints from "@/api/endpoints";

// Loads the reseller's wallet and exposes the two things a page can do with it:
// withdraw, and reload after something changed it (a status flip, say).
//
// Shared by WalletPage, DashboardPage, ProfitSummaryPage and CheckoutPage
// rather than each fetching /wallet its own way — four copies of "is this
// account deactivated" is four chances for the pages to disagree about it.

// Everything a page can read before the first response lands, so no caller has
// to guard against `wallet` being null.
const EMPTY_WALLET = {
  balance: 0,
  pendingCommission: 0,
  clearedCommission: 0,
  penaltyTotal: 0,
  shippingReturnPayment: 0,
  shippingAndReturnTotal: 0,
  penalties: [],
  transactions: [],
  withdrawalRequests: [],
  simulatedDate: null,
  isSimulated: false,
  effectiveDate: null,
  deactivated: false,
  deactivationMessage: null,
  returnPenalty: 100,
  support: { email: "", phone: "" },
  withdrawal: { allowedToday: false, weekday: "Monday", available: 0, nextWindow: null },
};

export function useWallet() {
  const [wallet, setWallet] = useState(EMPTY_WALLET);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (signal) => {
    let superseded = false;

    try {
      const data = await get(endpoints.wallet.root, { signal });
      setWallet(data?.wallet || EMPTY_WALLET);
      setError(null);
    } catch (err) {
      if (err?.name === "AbortError") superseded = true;
      else setError(err?.message || "Could not load your wallet.");
    } finally {
      if (!superseded) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const withdraw = useCallback(async (amount) => {
    const data = await post(endpoints.wallet.withdraw, { amount: Number(amount) });
    setWallet(data?.wallet || EMPTY_WALLET);
    return data?.wallet;
  }, []);

  const requestWithdraw = useCallback(async (amount) => {
    const data = await post(endpoints.wallet.withdrawRequest, { amount: Number(amount) });
    setWallet(data?.wallet || EMPTY_WALLET);
    return data?.wallet;
  }, []);

  const approveWithdrawal = useCallback(async (requestId) => {
    const data = await post(endpoints.wallet.approveRequest(requestId));
    setWallet(data?.wallet || EMPTY_WALLET);
    return data?.wallet;
  }, []);

  const rejectWithdrawal = useCallback(async (requestId) => {
    const data = await post(endpoints.wallet.rejectRequest(requestId));
    setWallet(data?.wallet || EMPTY_WALLET);
    return data?.wallet;
  }, []);

  const setDemoDate = useCallback(async (dateStr) => {
    const data = await post(endpoints.wallet.demoDate, { date: dateStr });
    setWallet(data?.wallet || EMPTY_WALLET);
    return data?.wallet;
  }, []);

  const applyWallet = useCallback((next) => {
    if (next) setWallet(next);
  }, []);

  return {
    wallet,
    loading,
    error,
    refresh: () => load(),
    withdraw,
    requestWithdraw,
    approveWithdrawal,
    rejectWithdrawal,
    setDemoDate,
    applyWallet,
  };
}

export default useWallet;
