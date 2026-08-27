# JW Studio 2.0 — Portfolio handoff

## Project summary

JW Studio 2.0 is an English-first fictional merchandise storefront for Jia Wei, a synthetic Malaysian lifestyle and beginner video-editing educator. It demonstrates a creator-specific brand experience, a complete browse-to-simulated-checkout flow, and an optional grounded AI helper.

All creator biography, product records, images, recommendations, and payment results are synthetic learning content. The project does not represent a real person, real inventory, real fulfilment, or real payment processing.

## What this project demonstrates

- Product discovery, requirements, architecture, named tasks, and acceptance criteria.
- React + TypeScript + Vite storefront with a reusable Frame by Frame design system.
- FastAPI backend with SQLite catalog truth and server-side demo checkout validation.
- Browser cart recovery with exact minor-unit money calculations.
- Data-backed product image variants that respond to selected clothing colours with matching alternative text.
- Approved-only knowledge sources, deterministic retrieval, provider isolation, safe AI fallback, and RAG evaluation cases.
- Responsive, keyboard-accessible navigation, product selection, cart, checkout, and assistant flows.
- Error, empty, loading, not-found, image-fallback, provider-unavailable, and insufficient-information states.

## Verification snapshot

- Backend: 57 pytest tests passed.
- Frontend: 20 Vitest tests passed; production build and lint passed.
- Browser: 12 Playwright checks passed across Desktop Chrome and Pixel 5, including VS-001 and keyboard/accessibility coverage.
- AI evaluation: 11 deterministic cases passed without requiring an external provider.

## Run locally

Follow the commands in `README.md`. Start the backend from `backend/` and the frontend from `frontend/`. The optional AI provider is configured only through the server-side variables in `backend/.env.example`; leaving them empty keeps the storefront usable with a safe assistant fallback.

## Known limitations and next steps

- No real provider is configured or evaluated in this local demo.
- Retrieval is deterministic lexical search; embeddings and ChromaDB remain future options.
- Product images are intentional local fallback visuals rather than real creator photography.
- Deployment is prepared but not published: CORS is opt-in and exact-origin based, and the selected Vercel + Render plan is documented in `docs/deployment-plan.md`.
- No authentication, inventory, shipping, or admin system is included.
- Before public deployment, execute the separately approved publish task, set provider environment variables, and repeat the health, security, and browser checks.
