import "./PageLoader.css";

// Suspense fallback for lazily-loaded routes. Deliberately minimal: on a fast
// connection a chunk resolves in a few frames, and anything heavier than this
// flashes on screen more than it reassures.
const PageLoader = () => (
  <div className="page-loader" role="status" aria-live="polite">
    <span className="page-loader__spinner" />
    <span className="page-loader__label">Loading…</span>
  </div>
);

export default PageLoader;
