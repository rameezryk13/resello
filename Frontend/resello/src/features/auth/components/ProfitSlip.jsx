import { useEffect, useRef, useState } from "react";
import { formatRupees } from "@/utils/currency";

// The reseller's own arithmetic, which is the whole pitch of the site: you set
// the price, the gap is yours. Same mechanic as ProfitInputRow on the product
// page, so the first thing a new user sees is the thing they'll actually use.
const WHOLESALE = 1450;
const SELLING = 2200;
const KEEP = SELLING - WHOLESALE;

// "Rs." with no decimals, matching how prices read everywhere else in the app.
const money = (value) => formatRupees(value, 0);

const COUNT_MS = 700;

// Ease-out: the figure sprints then settles, which reads as landing on a total
// rather than stopping mid-count.
const easeOut = (t) => 1 - (1 - t) ** 3;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Browsers don't run requestAnimationFrame in a background tab, so a page opened
// in one would sit on frame zero — a slip reading "You keep Rs. 0", which is
// worse than no animation because it states something false.
const canAnimate = () =>
  !prefersReducedMotion() && typeof document !== "undefined" && !document.hidden;

// The global reduced-motion block in global.css only neutralises CSS animation,
// so this JS count needs its own guard or it animates anyway.
function useCountUp(target) {
  const [value, setValue] = useState(() => (canAnimate() ? 0 : target));
  const frame = useRef(0);

  useEffect(() => {
    if (!canAnimate()) {
      setValue(target);
      return undefined;
    }

    let start;
    const step = (now) => {
      start ??= now;
      const progress = Math.min((now - start) / COUNT_MS, 1);
      setValue(Math.round(easeOut(progress) * target));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);

    // Backstop for a tab hidden mid-count: rAF pauses, so land on the real
    // figure rather than freezing part-way up.
    const settle = setTimeout(() => setValue(target), COUNT_MS + 400);

    return () => {
      cancelAnimationFrame(frame.current);
      clearTimeout(settle);
    };
  }, [target]);

  return value;
}

const ProfitSlip = () => {
  const keep = useCountUp(KEEP);

  return (
    <figure className="auth-slip">
      <figcaption className="auth-slip-label">on one dupatta</figcaption>

      <div className="auth-slip-row">
        <span>Wholesale</span>
        <span className="auth-slip-figure">{money(WHOLESALE)}</span>
      </div>

      <div className="auth-slip-row">
        <span>Your price</span>
        <span className="auth-slip-figure">{money(SELLING)}</span>
      </div>

      <div className="auth-slip-row auth-slip-row--total">
        <span>You keep</span>
        {/* Not aria-live: the count-up is decorative repetition of a figure this
            row already states, and announcing 700ms of increments is noise. */}
        <span className="auth-slip-figure auth-slip-keep">{money(keep)}</span>
      </div>
    </figure>
  );
};

export default ProfitSlip;
