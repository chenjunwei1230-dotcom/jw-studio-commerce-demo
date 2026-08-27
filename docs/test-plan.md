# Test Plan

## Critical user journeys

- **VS-001 — Browse to simulated payment result:** open the collection, open the Keep Showing Up Keychain detail page, select the required colour, add it to the browser cart, review the cart, choose a simulated payment path, and confirm the backend-validated synthetic result.
- **Empty-cart recovery:** open `/cart` with a fresh browser context and return to the collection through the empty state action.

## Unit and integration checks

- Frontend focused checks: `npm test`.
- Frontend production checks: `npm run build` and `npm run lint`.
- Backend regression checks: `..\.venv\Scripts\python.exe -m pytest` from `backend/`.
- The checkout request boundary must contain only product IDs, selected options, quantities, and an approved demo payment method; it must not contain prices, totals, card data, or credentials.

## Browser and responsive checks

- `npm run test:e2e` runs VS-001 and empty-cart recovery in Desktop Chrome and Pixel 5 projects.
- Verify the mobile navigation menu opens before the cart link is used.
- Verify required product options and the checkout payment path block progress with clear English messages.
- Verify the result states that no real payment was processed and that the backend summary is displayed.
- Verify empty-cart recovery and repeated demo completion do not create a real transaction.
- The demo uses synthetic content only; no real payment credential is requested or transmitted.
- Verify the optional AI helper can submit a question, display a safe unavailable or insufficient-information state, accept a repeated question, and leave the cart count unchanged on desktop and mobile.
- The accessibility browser checks cover keyboard activation for mobile navigation, product options, cart navigation, checkout submission, simulated payment selection, and assistant validation/recovery on the mobile viewport.
- Image checks confirm catalog images expose non-empty alternative text. The small-text creative-purple contrast issue was corrected with the `--color-creative-purple-ink` token; the measured contrast is 5.78:1 against soft white.

## AI evaluation checks

- The AI-003 browser check covers a supported-looking question when the provider is unavailable, an unsupported private-information question, repeated questions, and the unchanged optional cart flow.
- AI-002 backend checks cover grounded fake-provider responses, weak retrieval, provider failure, malformed output, unsafe output, prompt boundaries, and request validation.
- AI-004 evaluation checks run `backend/tests/test_ai_evaluation.py` with the deterministic matrix in `backend/data/ai/evaluation_set.json`; a live provider is optional and was not configured for the learning-demo verification.

## Release checklist

- [x] Requirements acceptance criteria reviewed.
- [x] Automated checks pass.
- [x] Critical user journeys pass in the browser flow.
- [x] Error and empty states checked.
- [x] No secrets or private data committed.
- [x] Deployment and rollback steps documented in `docs/deployment-plan.md`; public release remains a separately approved action.
