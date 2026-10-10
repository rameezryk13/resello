import { useState } from 'react';
import './IBANInput.css';

const IBANInput = ({
  value,
  onChange,
  label,
  error,
  id,
  required = true,
  onFocus,
  onBlur
}) => {
  const [bankAlert, setBankAlert] = useState(false);

  const handleIban = (e) => {
    let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (!raw.startsWith("PK")) {
      if (raw.startsWith("P")) raw = "PK" + raw.slice(1);
      else raw = "PK" + raw;
    }
    raw = raw.slice(0, 24);

    const bankCode = raw.slice(4, 8);
    if (bankCode.length === 4) {
      setBankAlert(!/^[A-Z]{4}$/.test(bankCode));
    } else {
      setBankAlert(false);
    }

    const pretty = raw.match(/.{1,4}/g)?.join(" ") || "";
    onChange(pretty);
  };

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label} {required && <span className="field-required">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        inputMode="text"
        placeholder="PK00 XXXX 0000 0000 0000 0000"
        autoComplete="off"
        value={value || ""}
        className={error || bankAlert ? "input-error" : ""}
        onFocus={onFocus}
        onBlur={() => { if (onBlur) onBlur(); setBankAlert(false); }}
        onChange={handleIban}
      />
      <span className="field-hint">
        Format: PK + 2 check digits + 4-letter bank code + 16 digits (24 chars total)
      </span>
      {error && !bankAlert && (
        <p className="validation-msg">
          {(value || "").replace(/\s/g, "").length === 0
            ? "IBAN number is required"
            : "IBAN must be: PK00 XXXX 0000 0000 0000 0000"}
        </p>
      )}
      {bankAlert && (
        <p className="validation-msg">Characters 5–8 must be letters (bank code, e.g. HABB)</p>
      )}
    </div>
  );
};

export default IBANInput;
