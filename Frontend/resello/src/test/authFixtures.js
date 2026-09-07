import { vi } from "vitest";

// The two auth states any component branches on. Kept here so a suite says
// which state it's testing in one word instead of hand-rolling a context value,
// and so a new field on the context is added in one place.
export const TEST_USER = {
  id: "u_test_1",
  name: "Ayesha Malik",
  email: "ayesha@example.com",
  phone: "0300 1234567",
};

export const signedInAuth = (overrides = {}) => ({
  user: TEST_USER,
  loading: false,
  isAuthenticated: true,
  signup: vi.fn(),
  login: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

export const signedOutAuth = (overrides = {}) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  signup: vi.fn(),
  login: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});
