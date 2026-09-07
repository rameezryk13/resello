import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import * as client from "../api/client";
import endpoints from "../api/endpoints";

const TOKEN_KEY = "resello:token";

// localStorage throws in private-mode Safari and when storage is full. A failed
// write costs the user a re-login, which is worth far less than a crash.
const readStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const writeStoredToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Session stays valid in memory for this tab; it just won't survive reload.
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Starts true only when there is a token worth checking, so a first-time
  // visitor never waits on a network round trip to see the page.
  const [loading, setLoading] = useState(() => Boolean(readStoredToken()));

  // persist=false is what "keep me signed in" being off means: the token lives
  // in memory so this tab works, but nothing is written, so closing the browser
  // ends the session.
  const applySession = useCallback(({ user: nextUser, token }, { persist = true } = {}) => {
    client.setAuthToken(token);
    if (persist) writeStoredToken(token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const clearSession = useCallback(() => {
    client.setAuthToken(null);
    writeStoredToken(null);
    setUser(null);
  }, []);

  // A token in localStorage is a claim, not proof — the server may have revoked
  // it. Confirm with /auth/me before treating the visitor as signed in.
  useEffect(() => {
    const token = readStoredToken();
    if (!token) return;

    let active = true;
    client.setAuthToken(token);

    client
      .get(endpoints.auth.me)
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) clearSession();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [clearSession]);

  // Any 401 from any call means this token is dead. The client fires the event
  // so a stale token found mid-session logs the user out rather than leaving
  // them looking at a page that silently fails every request.
  useEffect(() => {
    const onUnauthorized = () => clearSession();
    window.addEventListener(client.UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(client.UNAUTHORIZED_EVENT, onUnauthorized);
  }, [clearSession]);

  const signup = useCallback(
    async ({ name, email, phone, password }) => {
      const data = await client.post(endpoints.auth.signup, { name, email, phone, password });
      return applySession(data);
    },
    [applySession]
  );

  const login = useCallback(
    async ({ email, password, remember = true }) => {
      const data = await client.post(endpoints.auth.login, { email, password });
      return applySession(data, { persist: remember });
    },
    [applySession]
  );

  // Clearing locally regardless of the server's answer: if the token is already
  // invalid the POST fails, and the user still asked to be signed out.
  const logout = useCallback(async () => {
    try {
      await client.post(endpoints.auth.logout);
    } catch {
      // Ignored on purpose — see above.
    }
    clearSession();
  }, [clearSession]);

  const updateProfile = useCallback(async ({ name, phone, shopName, city, bankInfo }) => {
    const data = await client.put(endpoints.auth.me, { name, phone, shopName, city, bankInfo });
    if (data?.user) {
      setUser(data.user);
    }
    return data?.user;
  }, []);

  const deleteBankInfo = useCallback(async () => {
    const data = await client.del(endpoints.auth.meBank);
    if (data?.user) {
      setUser(data.user);
    }
    return data?.user;
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), signup, login, logout, updateProfile, deleteBankInfo }),
    [user, loading, signup, login, logout, updateProfile, deleteBankInfo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
