import { Link } from "react-router-dom";
import { Heart, PackageCheck, ShoppingBag } from "lucide-react";
import ProfitSlip from "./ProfitSlip";

// Left pane of both auth pages. Signup argues the case for an account; login
// only has to name what's waiting behind the door — nothing about a returning
// user is known before they sign in, so inventing figures for them would be a
// lie the page can't back up.
const SIGNUP_PROOF = [
  "No inventory",
  "COD payouts",
  "Free to join",
  "150k products",
];

const LOGIN_WAITING = [
  { Icon: ShoppingBag, label: "Cart saved", detail: "Everything you added is still there" },
  { Icon: Heart, label: "Favourites", detail: "The products you were watching" },
  { Icon: PackageCheck, label: "Order history", detail: "Track anything already on its way" },
];

const BrandPanel = ({ mode }) => (
  <aside className="auth-brand">
    <Link to="/" className="auth-brand-logo">
      ReSello
    </Link>

    {mode === "signup" ? (
      <>
        <h2 className="auth-brand-title">
          Start selling today.
          <br />
          Stock nothing.
        </h2>
        <p className="auth-brand-lede">
          Join 150,000+ resellers across Pakistan. Free account, wholesale prices, and
          every rupee above cost stays yours.
        </p>

        <ProfitSlip />

        <p className="auth-brand-note">
          You set the price. Every rupee above wholesale is yours.
        </p>

        <ul className="auth-proof">
          {SIGNUP_PROOF.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    ) : (
      <>
        {/* Not another "Welcome back" — the form heading already says that, and
            this pane's job is to name what's actually waiting. */}
        <h2 className="auth-brand-title">
          Pick up right where
          <br />
          you left off.
        </h2>
        <p className="auth-brand-lede">
          Nothing was lost while you were away. Sign in and it's all still here.
        </p>

        <ul className="auth-waiting">
          {LOGIN_WAITING.map((row) => (
            <li key={row.label}>
              <row.Icon size={18} aria-hidden="true" />
              <span>
                <strong>{row.label}</strong>
                {row.detail}
              </span>
            </li>
          ))}
        </ul>
      </>
    )}
  </aside>
);

export default BrandPanel;
