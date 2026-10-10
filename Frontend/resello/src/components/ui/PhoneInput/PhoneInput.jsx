import './PhoneInput.css';

export const isPhoneValid = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace('+92', '').replace(/\D/g, '');
  return digits.length === 10 && digits.startsWith('3');
};

const PhoneInput = ({ 
  value, 
  onChange, 
  label, 
  error, 
  placeholder = "+92 3xx xxxxxxx",
  id,
  onFocus,
  onBlur,
  required = true
}) => {
  const handlePhoneChange = (e) => {
    let raw = e.target.value;

    // Check if the input contains a full 10-digit mobile sequence (with optional leading 0)
    // E.g. "+92 303121234567" -> matches 03121234567 -> "3121234567"
    const fullMatch = raw.match(/0?(3\d{9})/);
    if (fullMatch) {
      onChange("+92 " + fullMatch[1]);
      return;
    }

    let digits = raw.replace(/\D/g, '');

    // If user typed/pasted with 92 country code or extra prefix
    if (digits.length > 10 && digits.slice(-10).startsWith('3')) {
      digits = digits.slice(-10);
    } else {
      if (digits.startsWith('92')) {
        digits = digits.slice(2);
      }
      if (digits.startsWith('0')) {
        digits = digits.slice(1);
      }
      if (!digits.startsWith('3')) {
        digits = '3' + digits;
      }
      digits = digits.slice(0, 10);
    }
    onChange("+92 " + digits);
  };

  const displayValue = value
    ? (value.startsWith("+92") ? value : "+92 " + value.replace(/^\+?92\s?/, ''))
    : "+92 3";

  const digits = displayValue.replace('+92', '').replace(/\D/g, '');
  const digitsLeft = Math.max(0, 10 - digits.length);

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label} {required && <span className="field-required">*</span>}
      </label>
      <input
        id={id}
        name={id}      
        autoComplete="tel"
        type="tel"
        inputMode="numeric"
        placeholder={placeholder}
        value={displayValue}
        className={error ? "input-error" : ""}
        onChange={handlePhoneChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {error && (
        <p className="validation-msg">
          {digits.length <= 1
            ? `${label} is required`
            : digitsLeft > 0
            ? `${digitsLeft} more digit${digitsLeft === 1 ? "" : "s"} needed`
            : typeof error === "string" && error !== "true"
            ? error
            : "Invalid phone number"}
        </p>
      )}
    </div>
  );
};

export default PhoneInput;
