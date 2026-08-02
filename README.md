# ReSello

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

- **No authentication.** No login, no sessions, no per-user data. The API trusts
  every caller, so the cart, orders, and favorites are global rather than
  per-account.
- **No database.** The backend keeps everything in memory. Restarting it discards
  all carts, orders, addresses, and favorites, resetting to the seed data in
  `defaultPagesData/`.
- **Order statuses are synthetic.** `OrdersPage` derives a status by hashing the
  order id, since the backend doesn't track fulfillment state.

The first two are the ones to address before this handles real customers.

