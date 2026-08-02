import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// client.js reads VITE_API_BASE_URL into a module-level const at import time,
// so the env has to be stubbed and the module re-imported for every test
// rather than imported once at the top of the file.

const BASE = "http://api.test";

let client;
let fetchMock;

// Minimal stand-in for a Response. Only the four members request() touches.
const fakeResponse = ({ ok = true, status = 200, statusText = "OK", json, text = "" } = {}) => ({
  ok,
  status,
  statusText,
  json: json ?? (() => Promise.reject(new SyntaxError("Unexpected token"))),
  text: () => Promise.resolve(text),
});

const jsonResponse = (body, init = {}) =>
  fakeResponse({ ...init, json: () => Promise.resolve(body), text: JSON.stringify(body) });

beforeEach(async () => {
  vi.stubEnv("VITE_API_BASE_URL", BASE);
  vi.resetModules();
  client = await import("./client");

  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("request URL and method", () => {
  it("prefixes the endpoint with the configured base URL", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }));

    await client.get("/products");

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/products`,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns the parsed JSON body", async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ id: 1, name: "Shoe" }]));

    await expect(client.get("/products")).resolves.toEqual([{ id: 1, name: "Shoe" }]);
  });

  it("sends a JSON body and content type on post", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await client.post("/cart", { productId: 7, qty: 2 });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(options.body).toBe(JSON.stringify({ productId: 7, qty: 2 }));
  });

  it("sends a JSON body on put", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await client.put("/cart/7", { qty: 5 });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("PUT");
    expect(options.body).toBe(JSON.stringify({ qty: 5 }));
  });

  it("sends no body or content type on delete", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));

    await client.del("/cart/7");

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("DELETE");
    expect(options.body).toBeUndefined();
    expect(options.headers).toBeUndefined();
  });

  it("forwards an abort signal to fetch", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    const controller = new AbortController();

    await client.get("/products", { signal: controller.signal });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.signal).toBe(controller.signal);
  });
});

describe("empty responses", () => {
  it("returns null for 204 No Content", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204, statusText: "No Content" }));

    await expect(client.del("/cart/7")).resolves.toBeNull();
  });

  it("returns null for a 200 with an empty body", async () => {
    // JSON.parse("") throws, so an empty 200 has to be handled separately.
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, text: "" }));

    await expect(client.get("/ping")).resolves.toBeNull();
  });
});

describe("error handling", () => {
  it("prefers the server's message field", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Not enough stock left" }, { ok: false, status: 400, statusText: "Bad Request" })
    );

    await expect(client.post("/orders", {})).rejects.toThrow("Not enough stock left");
  });

  it("carries the HTTP status on the thrown error", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Gone" }, { ok: false, status: 410, statusText: "Gone" })
    );

    // ProductDetailPage branches on status rather than message text, so the
    // status has to survive on the error object.
    await expect(client.get("/products/99")).rejects.toMatchObject({
      name: "ApiError",
      status: 410,
    });
  });

  it("throws an ApiError instance", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: false, status: 500, statusText: "Server Error" }));

    await expect(client.get("/products")).rejects.toBeInstanceOf(client.ApiError);
  });

  it("says 'Not found' for a 404 with no JSON body", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: false, status: 404, statusText: "Not Found" }));

    await expect(client.get("/products/99")).rejects.toThrow("Not found");
  });

  it("falls back to status and status text for other non-JSON failures", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ ok: false, status: 500, statusText: "Internal Server Error" })
    );

    await expect(client.get("/products")).rejects.toThrow(
      "Request failed (500 Internal Server Error)"
    );
  });

  it("reports a reachability problem when fetch itself rejects", async () => {
    // What the user sees when the backend isn't running at all.
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(client.get("/products")).rejects.toMatchObject({
      name: "ApiError",
      message: "Cannot reach the server. Check your connection and try again.",
      status: 0,
    });
  });

  it("lets an AbortError through untouched", async () => {
    // Effects cancelling on unmount check err.name === "AbortError". Wrapping
    // it in an ApiError would turn every navigation into a visible error toast.
    const abort = new Error("The operation was aborted.");
    abort.name = "AbortError";
    fetchMock.mockRejectedValue(abort);

    await expect(client.get("/products")).rejects.toBe(abort);
  });
});

describe("missing configuration", () => {
  it("warns once at import time when the base URL is unset", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("VITE_API_BASE_URL", "");
    vi.resetModules();

    await import("./client");

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("VITE_API_BASE_URL is not set"));
  });
});
