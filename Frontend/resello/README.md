# ReSello — Frontend

React 19 + Vite single-page app for the ReSello storefront.

Setup, scripts, project layout, and known limitations are documented once in the
[root README](../../README.md). This file covers only what is specific to the
frontend.

## Running it

```bash
npm install && cp .env.example .env && npm run dev
```

Serves on http://localhost:5173. The backend must be running on port 3000 or every
request fails — see the root README for that side.

## Stack

- **React 19** with **React Router 7**, routes lazily loaded in `src/App.jsx` so each
  page ships as its own chunk
- **Vite 8** for dev server and build
- **Vitest** + React Testing Library + jsdom for tests
- **lucide-react** for icons
- Plain CSS, one stylesheet per page, no CSS framework

## Where things live

- `src/api/client.js` — the only place `fetch` is called. Returns parsed JSON and
  throws an `ApiError` carrying an HTTP status and a user-readable message, so
  callers only need `try`/`catch`.
- `src/api/endpoints.js` — every backend path, mirroring the backend's route file.
- `src/features/pages/<Name>/` — one folder per page holding its JSX, CSS, and tests.
- `src/components/` — UI shared across pages, including `ErrorBoundary`.
- `src/utils/` — `currency.js` (`parsePrice`, `formatRupees`) and `validation.js`
  (IBAN and CNIC formatting and validation).

Prices arrive from the API in inconsistent shapes — `1500`, `"1500"`, `"1,500"`, and
`"Rs. 1,500"` all appear. Always run them through `parsePrice` before doing
arithmetic rather than `Number()`.

## Tests

```bash
npm run test:run
```

Config is in `vitest.config.js`, deliberately separate from `vite.config.js`. It
omits `@vitejs/plugin-react` on purpose; the comment in that file explains the
version mismatch it works around, and the failure it causes is silent, so read it
before editing.
