# ReSello

> 🌐 **Live Website**: [https://rameezryk13.github.io/resello/](https://rameezryk13.github.io/resello/)
> 
> Open the link above to test the live application directly in your browser.

A reseller storefront: shoppers browse products, add them to a cart, and check out;
resellers see the profit earned on each order in a dashboard, wallet, and profit
summary.

The repo holds two independent Node projects that run side by side — an Express API
(`Backend/`) and a React single-page app (`Frontend/resello/`). Each has its own
`package.json` and must be installed separately.

## Requirements

- Node.js 20 or newer (developed on 24.14.1)
- npm 10 or newer

## Quick start

Two terminals, backend first — the frontend has nothing to show until the API is up.

**Terminal 1 — API on port 3000:**

```bash
cd Backend && npm install && npm start
```

**Terminal 2 — dev server on port 5173:**

```bash
cd Frontend/resello && npm install && cp .env.example .env && npm run dev
```

Then open http://localhost:5173.

The `cp .env.example .env` step is only needed the first time. Without a `.env` the
frontend has no API URL, logs a warning to the console, and every request fails.

## Demo accounts

The wallet only tells a story once an account has orders behind it, so three demo
resellers can be seeded — one per state:

```bash
cd Backend && npm run seed:demo
```

| Email | Password | What it shows |
| --- | --- | --- |
| `healthy@resello.pk` | `Demo@1234` | Rs. 950 cleared, Rs. 470 still pending. The account to try a withdrawal from. |
| `negative@resello.pk` | `Demo@1234` | Rs. -100. Two returns cost more than the one cleared sale earned; the penalties are listed on Payment Summary. |
| `blocked@resello.pk` | `Demo@1234` | Rs. -520, past the deactivation line. Checkout and withdrawal are both refused by the API, not just hidden in the UI. |

The script is idempotent — it replaces those three accounts and leaves every other
account in `db.json` alone, so it is safe to re-run after poking at the demo data.

The rules the accounts demonstrate:

| Rule | Value |
| --- | --- |
| Commission per order | the order's profit, credited when the order is **Delivered** |
| Return penalty | Rs. 100 per returned order, plus the commission clawed back |
| Deactivation | balance ≤ **Rs. -500** blocks checkout and withdrawal |
| Withdrawal window | **Mondays only** |

**My Orders** carries a status switcher on each order. It stands in for the courier
webhook a real deployment would have, and it is the fastest way to watch a commission
clear or a penalty land. Statuses are reversible: flipping an order back to Delivered
re-credits the commission and refunds the penalty, so the demo data survives being
played with.

## Configuration

The frontend reads a single variable, `VITE_API_BASE_URL`, documented in
`Frontend/resello/.env.example`:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

Two things to know about Vite env files: only variables prefixed with `VITE_` reach
client code, and the file is read once when the dev server boots — restart
`npm run dev` after editing it.

`.env` is gitignored; `.env.example` is committed. Add new variables to both.

The backend's port (3000) and allowed CORS origins are hardcoded in
`Backend/server.js` and `Backend/src/app.js`. If you change the frontend's port,
add it to the `origin` list in `app.js` or the browser will block every request.

## Scripts

**Backend** (`cd Backend`)

| Command | What it does |
| --- | --- |
| `npm start` | Starts the API on port 3000 |
| `npm run seed:demo` | Creates the three demo reseller accounts (see above) |

**Frontend** (`cd Frontend/resello`)

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload on port 5173 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the built `dist/` locally |
| `npm run lint` | ESLint over the whole project |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Vitest once, for CI |
| `npm run test:coverage` | Test run with a coverage report |

## Layout

```
Backend/
  server.js                  Entry point — starts the app on port 3000
  src/app.js                 Express setup, CORS, /api mount
  src/routes/                All route handlers
  defaultPagesData/          Seed data: products, categories, rows, posters

Frontend/resello/
  src/api/                   client.js (fetch wrapper) + endpoints.js (route map)
  src/components/            Shared UI used across pages
  src/features/pages/        One folder per page, with its own CSS
  src/utils/                 currency.js, validation.js
  src/constants/             Shared constant values
  src/styles/                Global and shared stylesheets
  src/test/setup.js          Vitest setup, loaded before every test file
```

Two conventions worth following when adding code:

- **Never hardcode a URL.** Add the path to `src/api/endpoints.js` and call it
  through `src/api/client.js`. That file is the app's entire API surface in one
  screen, and it mirrors the backend's route file.
- **A page owns its folder.** `src/features/pages/CartPage/` holds `CartPage.jsx`,
  `CartPage.css`, and `CartPage.test.jsx` together.

## Tests

80 tests run against the currency and validation utilities, the API client, and the
cart and checkout pages. They use Vitest with React Testing Library and jsdom.

```bash
cd Frontend/resello && npm run test:run
```

Test config lives in `vitest.config.js`, kept separate from `vite.config.js` so
test-only settings never affect a production build. That file carries a comment
explaining why it deliberately omits `@vitejs/plugin-react` — worth reading before
changing it, because the failure mode it avoids is silent.

The backend has no tests; its `npm test` script is still the npm default and exits 1.

## Known limitations

These are properties of the current build, not bugs to be surprised by:

- **No database.** Everything persists to a single JSON file, `Backend/data/db.json`,
  written whole on every change. Fine at this scale, but there is no concurrency
  control and no migration path.
- **Order statuses are set by hand.** There is no courier integration, so the status
  switcher on My Orders is what moves an order to Delivered or Returned. Anyone
  signed in can change the status of their own orders — which is exactly what a real
  deployment must not allow.
- **Passwords are the only factor.** No email verification, no password reset, no
  rate limiting on sign-in.

The first two are the ones to address before this handles real customers.

