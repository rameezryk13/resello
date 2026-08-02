import { describe, it, expect } from "vitest";
import {
  formatIban,
  normalizeIban,
  isValidPakistanIban,
  formatCnic,
  isValidCnic,
} from "./validation";

// A false rejection here blocks a paying customer at the last step of
// checkout, so both directions matter: valid input must pass, and invalid
// input must not slip through.

describe("formatIban", () => {
  it("groups characters in fours", () => {
    expect(formatIban("PK36HABB0000000000000000")).toBe(
      "PK36 HABB 0000 0000 0000 0000"
    );
  });

  it("uppercases as the user types", () => {
    expect(formatIban("pk36habb")).toBe("PK36 HABB");
  });

  it("drops spaces and punctuation from pasted input", () => {
    // Bank statements print IBANs with spaces; users paste them verbatim.
    expect(formatIban("PK36 HABB-0000")).toBe("PK36 HABB 0000");
  });

  it("caps input at the 24-character IBAN length", () => {
    expect(normalizeIban(formatIban("PK36HABB0000000000000000EXTRA"))).toHaveLength(24);
  });

  it("leaves no trailing space on an exact multiple of four", () => {
    expect(formatIban("PK36")).toBe("PK36");
  });

  it("returns an empty string for empty input", () => {
    expect(formatIban("")).toBe("");
    expect(formatIban(null)).toBe("");
    expect(formatIban(undefined)).toBe("");
  });
});

describe("isValidPakistanIban", () => {
  it("accepts a correctly formed IBAN with spaces", () => {
    expect(isValidPakistanIban("PK36 HABB 0000 0000 0000 0000")).toBe(true);
  });

  it("accepts the same IBAN without spaces", () => {
    expect(isValidPakistanIban("PK36HABB0000000000000000")).toBe(true);
  });

  it("accepts lowercase input", () => {
    expect(isValidPakistanIban("pk36habb0000000000000000")).toBe(true);
  });

  it("accepts digits inside the account portion", () => {
    expect(isValidPakistanIban("PK24SCBL0000001234567890")).toBe(true);
  });

  it("rejects a non-PK country code", () => {
    expect(isValidPakistanIban("GB36HABB0000000000000000")).toBe(false);
  });

  it("rejects letters where the check digits belong", () => {
    expect(isValidPakistanIban("PKAAHABB0000000000000000")).toBe(false);
  });

  it("rejects a bank code that isn't four letters", () => {
    expect(isValidPakistanIban("PK3612340000000000000000")).toBe(false);
  });

  it("rejects an IBAN that is too short or too long", () => {
    expect(isValidPakistanIban("PK36HABB00000000000000")).toBe(false);
    expect(isValidPakistanIban("PK36HABB000000000000000000")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(isValidPakistanIban("")).toBe(false);
    expect(isValidPakistanIban(null)).toBe(false);
  });
});

describe("formatCnic", () => {
  it("inserts both dashes for a full CNIC", () => {
    expect(formatCnic("3520212345671")).toBe("35202-1234567-1");
  });

  it("adds no dash before the sixth digit", () => {
    expect(formatCnic("35202")).toBe("35202");
  });

  it("adds the first dash once the sixth digit arrives", () => {
    expect(formatCnic("352021")).toBe("35202-1");
  });

  it("adds the second dash once the thirteenth digit arrives", () => {
    expect(formatCnic("352021234567")).toBe("35202-1234567");
    expect(formatCnic("3520212345671")).toBe("35202-1234567-1");
  });

  it("strips non-digits so a re-typed value stays stable", () => {
    // The field re-formats its own output on every keystroke; without the
    // strip, existing dashes would be counted as characters and shift.
    expect(formatCnic("35202-1234567-1")).toBe("35202-1234567-1");
  });

  it("caps at 13 digits", () => {
    expect(formatCnic("35202123456789999")).toBe("35202-1234567-8");
  });

  it("returns an empty string for empty input", () => {
    expect(formatCnic("")).toBe("");
    expect(formatCnic(null)).toBe("");
  });
});

describe("isValidCnic", () => {
  it("accepts a correctly formatted CNIC", () => {
    expect(isValidCnic("35202-1234567-1")).toBe(true);
  });

  it("rejects an unformatted run of digits", () => {
    // The form always formats before validating, so bare digits mean
    // something bypassed the input handler.
    expect(isValidCnic("3520212345671")).toBe(false);
  });

  it("rejects wrong group lengths", () => {
    expect(isValidCnic("3520-1234567-1")).toBe(false);
    expect(isValidCnic("35202-123456-1")).toBe(false);
    expect(isValidCnic("35202-1234567-12")).toBe(false);
  });

  it("rejects letters", () => {
    expect(isValidCnic("3520A-1234567-1")).toBe(false);
  });

  it("rejects empty input", () => {
    expect(isValidCnic("")).toBe(false);
    expect(isValidCnic(null)).toBe(false);
  });
});
