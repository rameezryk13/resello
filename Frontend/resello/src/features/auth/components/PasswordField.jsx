import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { passwordStrength } from "@/utils/authValidation";

// Password input with a reveal toggle and, on signup, a strength meter.
//
// The toggle exists because typing a long password blind on a phone is the main
// reason people get locked out of their own new account.
const PasswordField = ({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  showMeter = false,
  placeholder,
}) => {
  const [revealed, setRevealed] = useState(false);
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const meterId = `${fieldId}-strength`;
  const strength = showMeter ? passwordStrength(value) : null;

  return (
    <div className="auth-field">
      <label htmlFor={fieldId}>{label}</label>

      <div className={`auth-input-wrap${error ? " auth-input-wrap--error" : ""}`}>
        <input
          id={fieldId}
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : strength?.label ? meterId : undefined}
        />
        <button
          type="button"
          className="auth-reveal"
          onClick={() => setRevealed((current) => !current)}
          // The control's job is stated, not its current state, so a screen
          // reader user hears what pressing it does.
          aria-label={revealed ? "Hide password" : "Show password"}
        >
          {revealed ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>

      {showMeter && strength.label && (
        <div className="auth-meter" id={meterId}>
          <div className="auth-meter-track">
            <div
              className="auth-meter-fill"
              data-score={strength.score}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <span className="auth-meter-label" data-score={strength.score}>
            {strength.label}
          </span>
        </div>
      )}

      {error && (
        <p className="auth-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordField;
