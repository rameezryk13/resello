/*
 * Remove the CSS left behind by the 13 bespoke empty states that
 * components/ui/EmptyState now replaces.
 *
 * Every selector below was confirmed to have zero remaining JSX references
 * before this ran. Rules are matched by selector and removed whole, along
 * with any leading comment block attached to them, so the flagged-token
 * notes don't outlive the rules they annotate.
 *
 * Usage: node scripts/drop-dead-empty-css.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const DEAD = [
  'cart-empty-state',
  'cart-empty-btn',
  'favorites-empty-state',
  'favorites-empty-icon',
  'favorites-empty-title',
  'favorites-empty-copy',
  'favorites-empty-btn',
  'track-empty',
  'track-empty-icon',
  'ps-empty',
  'account-empty',
  'event-page-empty',
  'row-products-loading',
  'row-products-error',
];

const FILES = [
  'src/features/cart/CartPage.css',
  'src/features/favorites/FavoritesPage.css',
  'src/features/track-order/TrackOrderPage.css',
  'src/features/profit-summary/ProfitSummaryPage.css',
  'src/features/orders/OrdersPage.css',
  'src/features/followed-shops/FollowedShopsPage.css',
  'src/features/profit-account/ProfitAccountPage.css',
  'src/features/dashboard/DashboardPage.css',
  'src/features/event/EventPage.css',
  'src/features/row/RowProductsPage.css',
];

// A dead selector may appear in a comma-separated selector list alongside live
// ones. Only the dead parts are dropped; if any live selector remains the rule
// stays, with its selector list rewritten.
const isDead = (selector) =>
  DEAD.some((cls) => new RegExp(`\\.${cls}(?![\\w-])`).test(selector));

let removed = 0;

for (const file of FILES) {
  const before = readFileSync(file, 'utf8');
  // Matches: optional preceding comment(s), a selector list, and one balanced
  // declaration block. Nested at-rules are handled by the recursion below.
  const rule = /(?:[ \t]*\/\*[\s\S]*?\*\/\s*)*[ \t]*([^{}@/]+?)\{([^{}]*)\}\n?/g;

  const after = before.replace(rule, (match, selectors) => {
    const parts = selectors.split(',').map((s) => s.trim()).filter(Boolean);
    if (!parts.some(isDead)) return match;

    const live = parts.filter((s) => !isDead(s));
    if (live.length === 0) {
      removed += 1;
      return '';
    }
    removed += 1;
    return match.replace(selectors, `${live.join(',\n')} `);
  });

  // Media queries whose body is now empty carry no meaning.
  const tidied = after
    .replace(/@media[^{]+\{\s*\}\n?/g, '')
    .replace(/\n{3,}/g, '\n\n');

  if (tidied !== before) writeFileSync(file, tidied);
}

console.log(`removed/rewrote ${removed} rule(s)`);
