import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  isValidEmail,
  isValidPakistanPhone,
  MIN_PASSWORD_LENGTH,
} from "@/utils/authValidation";
import BrandPanel from "./components/BrandPanel";
import PasswordField from "./components/PasswordField";
import "./AuthPage.css";

const EMPTY = { name: "", email: "", phone: "", password: "", confirm: "" };

// Source order, so a failed submit focuses the first problem rather than
// whichever one validate() happened to write last.
const FIELD_IDS = [
  ["name", "auth-name"],
  ["email", "auth-email"],
  ["phone", "auth-phone"],
  ["password", "auth-password"],
  ["confirm", "auth-confirm"],
  ["terms", "auth-terms"],
];

// One component for both pages so the shell, the brand pane and the error
// handling exist once. `mode` changes the copy, the fields and the pane ratio.
const AuthPage = ({ mode }) => {
  const isSignup = mode === "signup";
  const { signup, login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState(EMPTY);
  const [agreed, setAgreed] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Where the visitor was headed before the gate stopped them. Falls back to
  // the homepage so a direct visit to /login still lands somewhere sensible.
  const destination = location.state?.from || "/";

  // The first field is where the work starts, so put the caret there rather than
  // making a keyboard user tab past the logo and the "Sign in instead" link.
  useEffect(() => {
    document.getElementById(isSignup ? "auth-name" : "auth-email")?.focus();
  }, [isSignup]);

  const setField = (field) => (value) => {
    setValues((current) => ({ ...current, [field]: value }));
    // Clearing on edit: a message about what they just fixed is noise.
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const validate = () => {
    const next = {};

    if (isSignup && !values.name.trim()) next.name = "Enter your name.";

    if (!values.email.trim()) next.email = "Enter your email.";
    else if (!isValidEmail(values.email)) next.email = "Enter a valid email address.";

    // Phone is required at signup and must be a valid Pakistani mobile number
    if (isSignup && !values.phone.trim()) {
      next.phone = "Enter your phone number.";
    } else if (isSignup && !isValidPakistanPhone(values.phone)) {
      next.phone = "Use a Pakistani mobile number, like 0300 1234567.";
    }

    if (!values.password) next.password = "Enter your password.";
    else if (isSignup && values.password.length < MIN_PASSWORD_LENGTH) {
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (isSignup && values.confirm !== values.password) {
      next.confirm = "Both passwords need to match.";
    }

    if (isSignup && !agreed) next.terms = "Accept the terms to continue.";

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const found = validate();
    if (Object.keys(found).length) {
      setErrors(found);
      // Without this a submit can look like it did nothing: the message may be
      // below the fold, and nothing tells a screen reader anything changed.
      const [, firstBadId] = FIELD_IDS.find(([field]) => found[field]) || [];
      if (firstBadId) document.getElementById(firstBadId)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        const user = await signup({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          password: values.password,
        });
        // Same vocabulary as the button that got them here.
        toast.success(`Account created. Welcome, ${user.name.split(" ")[0]}.`);
      } else {
        const user = await login({
          email: values.email.trim(),
          password: values.password,
          remember,
        });
        toast.success(`Welcome back, ${user.name.split(" ")[0]}.`);
      }
      navigate(destination, { replace: true });
    } catch (err) {
      // The server's message names the fix ("That email is already registered.
      // Sign in instead."), so it's shown as-is rather than flattened.
      const message = err?.message || "Something went wrong. Try again.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Someone already signed in has no business on a sign-in form — send them
  // where they were headed instead of asking for a password they've given.
  if (isAuthenticated) return <Navigate to={destination} replace />;

  return (
    <div className={`auth-page auth-page--${mode}`}>
      <div className="auth-shell">
        <BrandPanel mode={mode} />

        <main className="auth-form-pane">
          <div className="auth-form-inner">
            <h1 className="auth-heading">{isSignup ? "Create your account" : "Welcome back"}</h1>
            <p className="auth-subheading">
              {isSignup ? (
                <>
                  Already have one? <Link to="/login" state={location.state}>Sign in</Link>
                </>
              ) : (
                <>
                  New here? <Link to="/signup" state={location.state}>Create a free account</Link>
                </>
              )}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {errors.form && (
                <p className="auth-form-error" role="alert">
                  {errors.form}
                </p>
              )}

              {isSignup && (
                <div className="auth-field">
                  <label htmlFor="auth-name">Full name</label>
                  <div className={`auth-input-wrap${errors.name ? " auth-input-wrap--error" : ""}`}>
                    <input
                      id="auth-name"
                      type="text"
                      value={values.name}
                      onChange={(event) => setField("name")(event.target.value)}
                      autoComplete="name"
                      placeholder="Ayesha Khan"
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "auth-name-error" : undefined}
                    />
                  </div>
                  {errors.name && (
                    <p className="auth-error" id="auth-name-error">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">Email</label>
                <div className={`auth-input-wrap${errors.email ? " auth-input-wrap--error" : ""}`}>
                  <input
                    id="auth-email"
                    type="email"
                    value={values.email}
                    onChange={(event) => setField("email")(event.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? "auth-email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p className="auth-error" id="auth-email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              {isSignup && (
                <div className="auth-field">
                  <label htmlFor="auth-phone">Phone number</label>
                  <div className={`auth-input-wrap${errors.phone ? " auth-input-wrap--error" : ""}`}>
                    <input
                      id="auth-phone"
                      type="tel"
                      value={values.phone}
                      onChange={(event) => setField("phone")(event.target.value)}
                      autoComplete="tel"
                      placeholder="0300 1234567"
                      aria-invalid={errors.phone ? true : undefined}
                      aria-describedby={errors.phone ? "auth-phone-error" : undefined}
                    />
                  </div>
                  {errors.phone && (
                    <p className="auth-error" id="auth-phone-error">
                      {errors.phone}
                    </p>
                  )}
                </div>
              )}

              <PasswordField
                id="auth-password"
                label="Password"
                value={values.password}
                onChange={setField("password")}
                error={errors.password}
                autoComplete={isSignup ? "new-password" : "current-password"}
                showMeter={isSignup}
                placeholder={isSignup ? `At least ${MIN_PASSWORD_LENGTH} characters` : undefined}
              />

              {isSignup && (
                <PasswordField
                  id="auth-confirm"
                  label="Confirm password"
                  value={values.confirm}
                  onChange={setField("confirm")}
                  error={errors.confirm}
                  autoComplete="new-password"
                />
              )}

              {isSignup ? (
                <div className="auth-terms">
                  <label className="auth-check">
                    <input
                      id="auth-terms"
                      type="checkbox"
                      checked={agreed}
                      onChange={(event) => {
                        setAgreed(event.target.checked);
                        setErrors((current) => ({ ...current, terms: undefined }));
                      }}
                      aria-invalid={errors.terms ? true : undefined}
                      aria-describedby={errors.terms ? "auth-terms-error" : undefined}
                    />
                    <span>
                      I agree to the <Link to="/terms">Terms</Link> and{" "}
                      <Link to="/privacy">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="auth-error" id="auth-terms-error">
                      {errors.terms}
                    </p>
                  )}
                </div>
              ) : (
                <label className="auth-check auth-check--inline">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
              )}

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={18} className="auth-spin" aria-hidden="true" />
                    {isSignup ? "Creating account" : "Signing in"}
                  </>
                ) : isSignup ? (
                  "Create free account"
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthPage;
