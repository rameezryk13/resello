// Validators for the signup and login forms.
//
// Pure string functions with no React involvement, kept beside validation.js
// for the same reason: getting them wrong turns away a real reseller with a
// real phone number, so they're worth testing directly rather than through the
// form. Everything here also runs server-side — this layer exists to answer
// the user before a round trip, not to be the only check.

// Deliberately permissive, and identical to the server's rule: catch a typo
// like "ayesha@gmail", don't adjudicate RFC 5322.
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value ?? "").trim());

// Names must be between 2 and 50 characters, contain only letters (supports Unicode),
// spaces, dots, hyphens, and apostrophes, and contain at least 2 actual letters.
export const isValidName = (value) => {
  const trimmed = String(value ?? "").trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  if (!/^[\p{L}\s.'-]+$/u.test(trimmed)) return false;
  const letters = trimmed.match(/\p{L}/gu) || [];
  return letters.length >= 2;
};

// Pakistani mobile numbers are 03XX XXXXXXX locally, +92 3XX XXXXXXX in
// international form. Both reach the same handset, so both are accepted, along
// with the spaces and dashes people naturally type.
export const isValidPakistanPhone = (value) => {
  const digits = String(value ?? "").replace(/[\s()-]/g, "");
  return /^(?:\+92|0092|0)3\d{9}$/.test(digits);
};

export const MIN_PASSWORD_LENGTH = 8;

// Scores a password 0–4 and names the score. The label is what the meter shows,
// so it has to mean something to a person: "Weak" through "Strong", never a
// number. Length dominates because it genuinely matters most; the character
// classes are secondary credit.
export const passwordStrength = (value) => {
  const password = String(value ?? "");

  if (!password) return { score: 0, label: "", percent: 0 };

  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  // Below the minimum the password can't be submitted at all, so calling it
  // anything but "Too short" would be misleading however varied it is.
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { score: 0, label: "Too short", percent: 20 };
  }

  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score], percent: Math.max(25, (score / 4) * 100) };
};
