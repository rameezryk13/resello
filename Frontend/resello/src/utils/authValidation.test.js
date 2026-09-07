import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidPakistanPhone,
  passwordStrength,
  MIN_PASSWORD_LENGTH,
} from "./authValidation";

// A false rejection here turns away someone trying to open an account, so both
// directions matter: real input must pass, and a typo must not slip through to
// a server round trip that will only reject it.

describe("isValidEmail", () => {
  it("accepts an ordinary address", () => {
    expect(isValidEmail("ayesha@example.com")).toBe(true);
  });

  it("accepts subdomains and plus addressing", () => {
    expect(isValidEmail("ayesha+resello@mail.example.co.uk")).toBe(true);
  });

  it("ignores surrounding whitespace", () => {
    expect(isValidEmail("  ayesha@example.com  ")).toBe(true);
  });

  it("rejects a missing top-level domain", () => {
    expect(isValidEmail("ayesha@gmail")).toBe(false);
  });

  it("rejects a missing @", () => {
    expect(isValidEmail("ayesha.example.com")).toBe(false);
  });

  it("rejects an internal space", () => {
    expect(isValidEmail("ayesha khan@example.com")).toBe(false);
  });

  it("rejects empty and nullish input", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});

describe("isValidPakistanPhone", () => {
  it("accepts the local 03XX form", () => {
    expect(isValidPakistanPhone("03001234567")).toBe(true);
  });

  it("accepts the +92 international form", () => {
    expect(isValidPakistanPhone("+923001234567")).toBe(true);
  });

  it("accepts the spacing and dashes people actually type", () => {
    expect(isValidPakistanPhone("+92 300 123 4567")).toBe(true);
    expect(isValidPakistanPhone("0300-1234567")).toBe(true);
    expect(isValidPakistanPhone("(0300) 1234567")).toBe(true);
  });

  it("rejects a number that is too short or too long", () => {
    expect(isValidPakistanPhone("0300123456")).toBe(false);
    expect(isValidPakistanPhone("030012345678")).toBe(false);
  });

  it("rejects a landline that does not start 03", () => {
    expect(isValidPakistanPhone("0511234567")).toBe(false);
  });

  it("rejects letters and empty input", () => {
    expect(isValidPakistanPhone("0300abcdefg")).toBe(false);
    expect(isValidPakistanPhone("")).toBe(false);
  });
});

describe("passwordStrength", () => {
  it("reports nothing for an empty password", () => {
    expect(passwordStrength("")).toEqual({ score: 0, label: "", percent: 0 });
  });

  it("calls anything under the minimum too short, however varied", () => {
    const result = passwordStrength("aB3$x");
    expect(result.label).toBe("Too short");
    expect(result.score).toBe(0);
    expect("aB3$x".length).toBeLessThan(MIN_PASSWORD_LENGTH);
  });

  it("scores a long mixed password strongest", () => {
    const result = passwordStrength("Resello2026!pk");
    expect(result.score).toBe(4);
    expect(result.label).toBe("Strong");
    expect(result.percent).toBe(100);
  });

  it("rates a bare minimum-length password weak", () => {
    expect(passwordStrength("aaaaaaaa").label).toBe("Weak");
  });

  it("gives credit for mixed case", () => {
    expect(passwordStrength("aaaAAAaa").score).toBeGreaterThan(
      passwordStrength("aaaaaaaa").score
    );
  });

  it("keeps the meter visible at every scored level", () => {
    ["aaaaaaaa", "aaaAAAaa", "Resello2026!pk"].forEach((password) => {
      expect(passwordStrength(password).percent).toBeGreaterThanOrEqual(25);
    });
  });
});
