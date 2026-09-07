// Central API client for the Resello frontend.
//
// Every backend call in the app goes through here instead of hardcoding
// http://localhost:3000. The base URL comes from VITE_API_BASE_URL so the
// same build can point at localhost, staging, or production.
//
// All helpers return the parsed JSON body and throw an Error carrying a
// message fit to show a user. Callers only need try/catch.

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  console.warn(
    "VITE_API_BASE_URL is not set — API calls will fail. " +
      "Copy .env.example to .env and restart the dev server."
  );
}

// Thrown by every helper below. Carries the HTTP status so callers can treat
// specific failures differently (ProductDetailPage keys "product not found"
// off status === 404 rather than matching on message text).
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// The session token, held here rather than read from localStorage per request
// so the client stays synchronous and testable. AuthProvider owns it and calls
// setAuthToken on login, logout, and when it restores a token on mount.
let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

// A 401 means the server no longer honours this token — expired, revoked, or
// signed out in another tab. Drop it and announce it once; AuthProvider listens
// and clears the user, which sends protected pages to /login.
export const UNAUTHORIZED_EVENT = "resello:unauthorized";

function handleUnauthorized() {
  if (!authToken) return;
  authToken = null;
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}

// The server sends { message } on failure. Prefer it over the bare status
// text, since it is written for humans. Falls back when the body is empty or
// isn't JSON — which is what happens when the backend is down entirely.
async function errorFrom(response) {
  let message = "";

  try {
    const data = await response.json();
    if (typeof data?.message === "string") message = data.message;
  } catch {
    // Not JSON. Fall through to the generic message below.
  }

  if (!message) {
    message =
      response.status === 404
        ? "Not found"
        : `Request failed (${response.status} ${response.statusText})`;
  }

  return new ApiError(message, response.status);
}

async function request(endpoint, options = {}) {
  const { body, signal, headers: extraHeaders, ...rest } = options;

  // Built up rather than hardcoded so that with no body and no token the
  // options object carries no headers key at all — exactly the shape a plain
  // GET or DELETE had before auth existed.
  const headers = {
    ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...extraHeaders,
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...rest,
      signal,
      ...(Object.keys(headers).length === 0 ? {} : { headers }),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (err) {
    // An aborted request is the caller cancelling on unmount, not a failure —
    // let it through untouched so effects can ignore it by name.
    if (err?.name === "AbortError") throw err;
    throw new ApiError(
      "Cannot reach the server. Check your connection and try again.",
      0
    );
  }

  if (response.status === 401) handleUnauthorized();

  if (!response.ok) throw await errorFrom(response);

  // 204 and other empty bodies would blow up .json().
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const get = (endpoint, options) => request(endpoint, { ...options, method: "GET" });

export const post = (endpoint, body, options) =>
  request(endpoint, { ...options, method: "POST", body });

export const put = (endpoint, body, options) =>
  request(endpoint, { ...options, method: "PUT", body });

export const del = (endpoint, options) =>
  request(endpoint, { ...options, method: "DELETE" });

export { API_BASE };
