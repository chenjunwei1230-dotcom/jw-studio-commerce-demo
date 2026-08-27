# Deployment Plan

**Status:** Prepared and verified on 2026-08-23. No public deployment has been performed.

## Decision

Use two small services for the learning demo:

| Area | Selected option | Configuration boundary |
|---|---|---|
| Frontend | Vercel static deployment for the existing Vite app | Project root `frontend/`, build `npm run build`, output `dist/`, SPA deep-link rewrite in `frontend/vercel.json` |
| Backend | Render Web Service for the existing FastAPI app | Project root `backend/`, build `pip install -r requirements.txt && python seed_catalog.py`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Domain | Provider subdomains first | Defer buying or connecting a custom domain until the demo is stable |
| Catalog | SQLite generated from `backend/data/products.json` | Read-only synthetic catalog for this demo; no customer or order persistence |

This keeps the React browser application separate from the protected FastAPI provider boundary. Vercel documents Vite deployments and preview URLs, while Render documents FastAPI web-service deployment and managed HTTPS. See the official references below.

## Environment variables

### Vercel frontend

Set only this public, non-secret build variable:

```text
VITE_API_BASE_URL=https://<render-service>.onrender.com
```

`VITE_API_BASE_URL` contains an origin, not an API key. The frontend keeps the local same-origin `/api/...` fallback when this variable is empty. Do not put `AI_PROVIDER_API_KEY`, provider credentials, payment details, or private creator data in any `VITE_*` variable.

### Render backend

Set these server-side variables in the Render service settings. Values are never committed to the repository:

```text
AI_PROVIDER_URL=<provider URL, optional>
AI_PROVIDER_API_KEY=<provider secret, optional>
AI_PROVIDER_MODEL=<provider model, optional>
AI_PROVIDER_TIMEOUT_SECONDS=8
CORS_ALLOWED_ORIGINS=https://<vercel-project>.vercel.app
```

`CORS_ALLOWED_ORIGINS` is a comma-separated exact-origin list. The application removes duplicates and ignores the wildcard `*`; deployment must use the exact HTTPS frontend origin. Credentials are disabled because this project has no browser session or cookie authentication.

## HTTPS and browser access

- Use the Vercel HTTPS frontend URL and the Render HTTPS backend URL.
- Do not publish the app with an HTTP API base URL.
- Configure the final Vercel production origin in Render's `CORS_ALLOWED_ORIGINS`.
- If a custom domain is added later, update both the Vercel public variable and the Render allowlist together.
- Keep preview deployments separate from production; add a preview origin only when intentionally testing it.
- Keep the SPA deep-link rewrite enabled so direct visits and refreshes on `/shop`, `/cart`, `/checkout`, and product routes load the client application.

## Error and demo-payment behavior

- `/api/health` is the post-deploy smoke check.
- Catalog, checkout, and assistant failures must remain user-safe: no stack traces, filesystem paths, provider errors, or secrets are returned.
- If the AI provider is unavailable, the assistant shows its safe fallback and the shop and simulated checkout remain usable.
- Checkout remains explicitly simulated. The UI must continue to say that no real payment, order, fulfilment, or charge occurs.
- The backend recalculates totals from the SQLite catalog; the browser never becomes the source of price or payment truth.

## Data and persistence limits

- Render build-time seeding recreates `catalog.sqlite3` from the authoritative JSON seed source.
- This demo does not persist users, carts, orders, payment credentials, stock, shipping records, or refunds.
- Browser cart state remains local to the visitor's device.
- A future production store would need a managed database, persistence policy, authentication, real payment provider, inventory, fulfilment, monitoring, and a privacy review. Those are out of scope here.

## Release checklist

- [x] Hosting choices are selected and documented.
- [x] Frontend/backend origin split is represented by `VITE_API_BASE_URL`.
- [x] React Router deep links have a Vercel SPA rewrite to `index.html`.
- [x] Backend CORS is opt-in and exact-origin based.
- [x] Provider secrets remain backend-only and are not exposed in frontend code.
- [x] HTTPS, error fallback, simulated-payment messaging, and data limitations are documented.
- [x] Local frontend tests, build, lint, and backend tests pass after the deployment-readiness changes.
- [ ] Create the Vercel and Render services with the user's accounts.
- [ ] Set real deployment URLs and environment values in provider dashboards.
- [ ] Run the separate approved publish task and production smoke tests.

## Rollback plan

1. Stop promotion if the health check, catalog load, checkout validation, or AI fallback check fails.
2. Roll back the frontend to the previous known-good Vercel deployment or redeploy the previous approved commit.
3. Roll back the backend to the matching previous approved commit; keep frontend and backend origins unchanged during rollback.
4. If a schema or seed change is involved, rebuild the SQLite catalog from the matching commit's `products.json`.
5. Record the failure and the verified recovery before attempting another release.

## Official references

- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Deploy a FastAPI App on Render](https://render.com/docs/deploy-fastapi)
- [Render managed TLS certificates](https://render.com/docs/tls)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
