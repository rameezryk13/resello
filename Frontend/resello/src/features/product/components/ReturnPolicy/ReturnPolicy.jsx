import { PackageCheck } from "lucide-react";
import "./ReturnPolicy.css";

// `variant` selects which breakpoint this copy of the policy belongs to.
// Both copies share the same expanded state so toggling one matches the other.
const ReturnPolicy = ({ variant, expanded, onToggle }) => (
  <div className={`pdp-return-policy pdp-return-policy--${variant}`}>
    <div className="pdp-return-icon" aria-hidden="true">
      <PackageCheck size={22} strokeWidth={2.2} />
    </div>
    <div className="pdp-return-text-wrap">
      <h3>Return allowed within 7 days</h3>
      <div className={`pdp-return-body ${expanded ? "expanded" : ""}`}>
        <p>
          Order ghalat, mukhtalif ya na-mukamal deliver hone ki surat
          mein return ki darkhast saat (7) din k andar de ja sakti hai.
        </p>
        <p>
          Return k liyay Resello App ke Order screen pe apne order k sath
          moujood Return button click karain.
        </p>
      </div>
      <button
        type="button"
        className="pdp-mobile-show-all-btn"
        onClick={onToggle}
      >
        {expanded ? "Hide" : "Show"}
      </button>
    </div>
  </div>
);

export default ReturnPolicy;
