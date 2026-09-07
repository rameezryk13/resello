import { PackageOpen } from "lucide-react";
import "./EmptyState.css";

/*
 * One empty state for every list in the app.
 *
 * There were 13 separate implementations before this — some a styled card,
 * most a bare <p> with a sentence in it. The bare ones are why an empty page
 * read as a broken page: no icon, no hierarchy, nothing to distinguish
 * "nothing here yet" from "something went wrong".
 *
 * Copy stays with the caller. This owns only the shape: icon, title,
 * description, optional action.
 *
 * `variant` shifts the tone without changing the layout:
 *   empty   — nothing here yet (default)
 *   loading — request in flight; the icon is hidden, since a static icon
 *             next to "Loading..." reads as a final state
 *   error   — request failed
 */
const EmptyState = ({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  variant = "empty",
  className = "",
}) => (
  <div
    className={`empty-state empty-state--${variant} ${className}`.trim()}
    // Announced politely: these swap in after an async load, and a list
    // going empty shouldn't interrupt whatever the user is reading.
    role="status"
    aria-live="polite"
  >
    {variant !== "loading" && Icon ? (
      <span className="empty-state__icon" aria-hidden="true">
        <Icon strokeWidth={1.5} />
      </span>
    ) : null}

    {title ? <p className="empty-state__title">{title}</p> : null}
    {description ? <p className="empty-state__description">{description}</p> : null}
    {action ? <div className="empty-state__action">{action}</div> : null}
  </div>
);

export default EmptyState;
