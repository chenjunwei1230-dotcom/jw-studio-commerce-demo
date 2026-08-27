# Task List

## Document status

Approved requirements and architecture have been translated into an implementation plan. The task list is the execution contract for Codex: complete one named task at a time, verify it, and update the relevant documentation before moving on.

The first implementation target is **VS-001 — Browse to simulated payment result**. The RAG assistant is intentionally scheduled after this core journey is reliable.

## How to use this plan with Codex

For each task, give Codex the task ID and ask it to:

1. Read `AGENTS.md` and the relevant product, requirements, architecture, and test documents.
2. Work only on the named task and its acceptance criteria.
3. Explain the files it will change before implementation.
4. Implement the smallest complete change.
5. Run the verified checks for that task.
6. Report what changed, what was verified, and any remaining risks.

After an implementation task, switch Codex to the **Reviewer** role using a fresh request or a clearly stated new role. The reviewer checks the work against the task and does not silently expand the scope.

## Task status legend

- `[x]` Completed and verified.
- `[ ]` Not started or still in progress.
- `Blocked` — Cannot proceed without an external decision or change of environment; the blocker must be named.

## Definition of done

A task is complete only when:

- Its acceptance criteria are satisfied.
- Relevant automated checks or a documented manual check have been run.
- Loading, empty, error, and recovery behavior has been considered where relevant.
- Security and privacy implications have been considered.
- The affected documentation is synchronized.
- No unrelated files or dependencies were added.
- Any assumption that could affect product behavior is recorded.

## Dependency map

```text
Approved docs
    ↓
SETUP-001 → DATA-001 → API-001
                         ↓
                       UI-001
                         ↓
            UI-002 → UI-003 → UI-004
                                      ↓
                                  CART-001
                                      ↓
                           CHECKOUT-001 → CHECKOUT-002
                                              ↓
                                          QA-001 / VS-001
                                              ↓
                          AI-001 → AI-002 → AI-003 → AI-004
                                              ↓
                                  QA-002 → SEC-001 → DOC-001
```

The dependency map is directional, not a reason to bundle unrelated work into one large task. A task may be split further if its implementation becomes difficult to review.

## Discovery and planning record

- `[x]` DISC-001 — Define the product brief, Jia Wei story, target users, 13-product scope, and non-goals.
- `[x]` DISC-002 — Convert the brief and brand bible into numbered requirements and acceptance criteria.
- `[x]` DISC-003 — Compare a small set of realistic technology choices and select a learnable full-stack direction.
- `[x]` DISC-004 — Define and approve the React + TypeScript + Vite / FastAPI / SQLite / RAG architecture.
- `[x]` DISC-005 — Define the first vertical slice and the initial test plan.
- `[x]` PLAN-001 — Split the approved architecture into the executable tasks in this document.

## Phase 1 — Project foundation

### SETUP-001 — Verify the toolchain and create the project skeleton

- **Status:** Completed and verified.
- **Depends on:** Approved architecture.
- **Outcome:** A minimal frontend and backend workspace exists, and the actual available tools and run/test commands are documented.
- **Acceptance criteria:**
  - [x] The installed Node.js, Python, and package tooling are inspected rather than assumed.
  - [x] A minimal React + TypeScript + Vite frontend skeleton is created.
  - [x] A minimal Python + FastAPI backend skeleton is created.
  - [x] Frontend and backend can each start using commands verified in this repository.
  - [x] `README.md` records the verified setup, run, and test commands.
  - [x] No API keys, credentials, or generated secrets are added.
- **Verification:** Start each application and run the first available health/build checks using the commands recorded by this task.
- **Likely files:** `frontend/`, `backend/`, `README.md`, dependency manifests, `.gitignore`.

### DATA-001 — Define the product model and seed the 13 demo products

- **Status:** Completed and verified.
- **Depends on:** SETUP-001.
- **Outcome:** The backend has one authoritative, structured source for the complete synthetic catalog.
- **Acceptance criteria:**
  - [x] Exactly 13 products are present.
  - [x] The catalog contains 5 decorative items, 5 clothing items, and 3 hats or headwear items.
  - [x] Every product has a stable ID, name, category, price, currency, description, image reference, and applicable options.
  - [x] Clothing options include realistic synthetic size and colour values where relevant.
  - [x] Materials, care guidance, design meaning, and creator recommendation fields are represented where relevant.
  - [x] All product facts are clearly synthetic learning content.
  - [x] Seed data can be loaded repeatedly without creating duplicate records.
- **Verification:** Run a data validation check that asserts the total count, category counts, required fields, unique IDs, and valid non-negative prices.
- **Likely files:** `backend/app/domain/`, `backend/data/`, `backend/tests/`.

## Phase 2 — Catalog API and storefront shell

### API-001 — Build the health and catalog API

- **Status:** Completed and verified.
- **Depends on:** DATA-001.
- **Outcome:** The frontend can retrieve authoritative product data through a small validated API.
- **Acceptance criteria:**
  - [x] `GET /api/health` returns a useful success response.
  - [x] `GET /api/products` returns all 13 products from the authoritative source.
  - [x] `GET /api/products/{product_id}` returns one product for a valid ID.
  - [x] An unknown product ID returns a clear not-found response.
  - [x] Response fields are shaped consistently and do not expose internal implementation details.
  - [x] Backend tests cover success, not-found, and catalog-count behavior.
- **Verification:** Run the backend test suite and exercise the three endpoints using the verified local API check.
- **Likely files:** `backend/app/api/`, `backend/app/main.py`, `backend/app/services/`, `backend/tests/`.

### UI-001 — Create the application shell and Frame by Frame design tokens

- **Status:** Completed and verified.
- **Depends on:** SETUP-001.
- **Outcome:** The frontend has route structure, shared navigation, responsive foundations, and the approved visual language.
- **Acceptance criteria:**
  - [x] Routes exist for homepage, shop, product detail, cart, checkout, and demo result.
  - [x] Shared navigation works on mobile and desktop.
  - [x] The Frame by Frame tokens include the approved provisional colour direction, typography roles, spacing, focus states, and responsive breakpoints.
  - [x] The design communicates a warm creator workspace rather than a generic influencer page or cold SaaS dashboard.
  - [x] Buttons, links, and form controls have visible keyboard focus states.
  - [x] The shell includes a usable loading, not-found, and generic error presentation pattern.
- **Verification:** Run the frontend build/check and manually inspect the shell at narrow mobile and desktop widths.
- **Likely files:** `frontend/src/app/`, `frontend/src/components/`, `frontend/src/styles/`, `frontend/src/pages/`.

### UI-002 — Build the Jia Wei homepage and creator story

- **Status:** Completed and verified.
- **Depends on:** UI-001.
- **Outcome:** A visitor understands Jia Wei, her journey, and the reason for the collection before entering the shop.
- **Acceptance criteria:**
  - [x] The homepage identifies Jia Wei as a Malaysian lifestyle and beginner editing educator.
  - [x] The injury recovery, editing-learning, persistence, and feedback journey are communicated in clear English.
  - [x] The core belief is expressed without presenting the fictional biography as verified real-world fact.
  - [x] The hero has a clear primary route to the collection.
  - [x] Creator-specific Frame by Frame motifs support the story without overwhelming it.
  - [x] Image failure and missing image states remain usable.
- **Verification:** Manually review the homepage against `docs/brand-bible.md` and the FR-001 acceptance criteria at mobile and desktop widths.
- **Likely files:** `frontend/src/pages/`, `frontend/src/features/creator/`, `frontend/public/`, `frontend/src/styles/`.

### UI-003 — Build the collection page and catalog states

- **Status:** Completed and verified.
- **Depends on:** API-001, UI-001.
- **Outcome:** Visitors can scan all 13 products and move to any product detail page.
- **Acceptance criteria:**
  - [x] Products are rendered from API data, not duplicated hard-coded page markup.
  - [x] The page clearly communicates the three product categories and the total collection.
  - [x] Product cards use the Frame by Frame timeline/frame language in a restrained, readable way.
  - [x] Each card shows product name, price, category, image, and a clear detail action.
  - [x] Loading, empty, API-error, and retry states are implemented.
  - [x] Product images have useful alternative text.
- **Verification:** Run the frontend checks and manually confirm the catalog count and state transitions using the local API.
- **Likely files:** `frontend/src/features/catalog/`, `frontend/src/pages/`, `frontend/src/components/`.

### UI-004 — Build product detail and option selection

- **Depends on:** API-001, UI-003.
- **Outcome:** A visitor can understand one product and make a valid selection before adding it to the cart.
- **Status:** Completed and verified.
- **Acceptance criteria:**
  - [x] The detail view displays image, name, price, description, material, options, and design meaning when available.
  - [x] Required options are visibly identified.
  - [x] Add-to-cart is blocked until required options are selected.
  - [x] The page supports the relevant clothing, headwear, and decorative-item option patterns.
  - [x] Catalog-provided image variants update the product visual and alternative text when a supported option changes.
  - [x] Unknown product IDs have a clear not-found state and route back to the collection.
  - [x] Missing optional product content does not create broken labels or empty visual blocks.
- **Verification:** Test one product from each category manually, including missing-option, valid-option, not-found, and image-failure behavior.
- **Likely files:** `frontend/src/features/products/`, `frontend/src/pages/`, `frontend/src/components/`.

## Phase 3 — Cart and demo checkout vertical slice

### CART-001 — Add browser cart state and cart recovery

- **Depends on:** UI-004.
- **Outcome:** A visitor can add, review, and remove a product selection before checkout.
- **Status:** Completed and verified.
- **Acceptance criteria:**
  - [x] A valid product selection can be added to the cart.
  - [x] Cart items preserve product ID, selected options, quantity, and display information.
  - [x] The cart shows unit price, line details, and subtotal from application data.
  - [x] The user can remove an item and recover from an empty cart.
  - [x] Invalid or corrupted stored cart data is handled safely.
  - [x] Cart behavior does not depend on the AI assistant.
- **Verification:** Run focused cart logic checks and manually test add, remove, refresh, corrupted-storage, and empty-cart behavior.
- **Likely files:** `frontend/src/features/cart/`, `frontend/src/app/`, `frontend/src/pages/`, `frontend/src/components/`.

### CHECKOUT-001 — Build backend demo checkout validation

- **Depends on:** API-001, CART-001.
- **Outcome:** The backend validates the selected product and options, recalculates the total, and returns a synthetic demo result.
- **Status:** Completed and verified.
- **Acceptance criteria:**
  - [x] The endpoint accepts only the minimum demo checkout information.
  - [x] Product IDs, options, and quantities are validated against authoritative data.
  - [x] The backend calculates the total; it never trusts a browser-supplied total or price.
  - [x] Only clearly labelled simulated payment methods are accepted.
  - [x] No card number, CVV, bank password, or real payment credential is accepted.
  - [x] The result contains an explicit demo-only indicator and synthetic reference.
  - [x] Invalid requests return safe, field- or item-specific errors.
- **Verification:** Run backend tests for valid checkout, invalid product, invalid option, invalid quantity, total mismatch, and forbidden payment fields.
- **Likely files:** `backend/app/api/`, `backend/app/domain/`, `backend/app/services/`, `backend/tests/`.

### CHECKOUT-002 — Build checkout form, simulated payment, and result page

- **Depends on:** CHECKOUT-001, CART-001, UI-001.
- **Outcome:** The visitor can complete the full demo purchase flow without real payment.
- **Status:** Completed and verified.
- **Acceptance criteria:**
  - [x] Checkout clearly states that it is a learning demo and not a real purchase.
  - [x] Required fields are identified and validated with human-readable messages.
  - [x] The confirmation action is clearly labelled as simulated or demo-only.
  - [x] Submission state prevents accidental duplicate confirmation.
  - [x] Backend validation errors are rendered without exposing internals.
  - [x] Success leads to a clearly labelled demo payment-result page.
  - [x] The result shows the validated selected item and calculated summary.
  - [x] The user can return to the shop; no real order, fulfilment, or charge is implied.
- **Verification:** Manually complete valid and invalid flows on mobile and desktop, including retry after a failed demo action.
- **Likely files:** `frontend/src/features/checkout/`, `frontend/src/pages/`, `frontend/src/components/`.

### QA-001 — Verify VS-001 end to end

- **Depends on:** CHECKOUT-002, UI-002, UI-003, UI-004.
- **Outcome:** The browse-to-simulated-payment-result journey is verified as one complete user flow.
- **Status:** Completed and verified.
- **Acceptance criteria:**
  - [x] The flow passes on a mobile viewport.
  - [x] The flow passes on a desktop viewport.
  - [x] Product identity, selected options, and subtotal stay consistent from detail to result.
  - [x] Empty-cart recovery works.
  - [x] Invalid required input blocks progress clearly.
  - [x] No real payment credential is requested or transmitted.
  - [x] The result explicitly states that no real payment was processed.
  - [x] The flow can be repeated without creating a real transaction.
- **Verification:** Added and ran the Playwright VS-001 flow in Desktop Chrome and Pixel 5 projects, plus frontend build, lint, unit tests, and backend pytest. Verified commands are recorded in `README.md` and `docs/test-plan.md`.
- **Likely files:** `frontend/tests/` or `tests/e2e/`, `docs/test-plan.md`, `README.md`.

## Phase 4 — Grounded RAG assistant

### AI-001 — Prepare the approved synthetic knowledge base

- **Depends on:** DATA-001, QA-001.
- **Outcome:** The assistant has a small, reviewable set of approved English documents about Jia Wei, the brand, products, FAQs, materials, sizing, care, and recommendations.
- **Status:** Completed and verified.
- **Acceptance criteria:**
  - [x] Every knowledge document has a stable source ID and topic label.
  - [x] Product facts match the authoritative product data where they overlap.
  - [x] The fictional biography is labelled as synthetic learning content in project documentation.
  - [x] The knowledge base contains explicit “not enough information” boundaries.
  - [x] The documents do not contain secrets, real private information, or unsupported claims.
- **Verification:** Ran the knowledge consistency checks against `backend/data/products.json`, reviewed the creator, brand, FAQ, sizing, and boundary sources, and ran the full backend test suite.
- **Likely files:** `backend/data/knowledge/`, `docs/brand-bible.md`, `docs/decisions/`.

### AI-002 — Implement retrieval and the server-side AI provider boundary

- **Status:** Completed and verified.
- **Depends on:** AI-001, SETUP-001.
- **Outcome:** The backend can retrieve approved context and call a provider through a protected adapter when configured.
- **Acceptance criteria:**
  - [x] Retrieval is limited to approved knowledge documents.
  - [x] API keys and provider configuration remain server-side.
  - [x] Request size and basic input validation are enforced.
  - [x] The prompt explicitly forbids inventing prices, totals, stock, payment status, or personal facts.
  - [x] Weak retrieval returns an honest insufficient-information response.
  - [x] Provider failure returns a safe fallback and does not break storefront or checkout.
  - [x] Structured transaction data is not delegated to the model.
- **Verification:** Ran the full backend suite: 48 passed. AI tests cover approved-only retrieval, strong and weak retrieval, fake-provider success, provider failure, malformed and unsafe output, request validation, server-side endpoint wiring, and exclusion of transaction values from provider context. A manual local endpoint check confirmed a 200 safe fallback when no provider is configured and a 422 response for an oversized question.
- **Likely files:** `backend/app/services/ai/`, `backend/app/api/`, `backend/tests/`, protected environment configuration examples.

### AI-003 — Add the optional assistant interface

- **Status:** Completed and verified.
- **Depends on:** AI-002, UI-003.
- **Outcome:** Visitors can ask supported questions without interrupting the main shopping flow.
- **Acceptance criteria:**
  - [x] The assistant is clearly presented as an AI helper, not Jia Wei herself.
  - [x] The UI supports question submission, response loading, answer display, and failure recovery.
  - [x] The assistant remains usable on a mobile viewport with the keyboard visible.
  - [x] It does not mutate cart state or transaction values.
  - [x] The interface uses concise, friendly English matching the brand voice.
  - [x] The assistant can be ignored while the user completes VS-001.
- **Verification:** Ran frontend unit tests, build, lint, and Playwright on Desktop Chrome and Pixel 5. The AI-003 browser test covers provider-unavailable recovery, insufficient-information behavior, repeated questions, unchanged cart count, and optional mobile navigation. Browser inspection also confirmed the responsive single-column assistant layout and no console errors.
- **Likely files:** `frontend/src/features/assistant/`, `frontend/src/components/`, `frontend/src/pages/`.

### AI-004 — Create the RAG evaluation set and safety checks

- **Status:** Completed and verified.
- **Depends on:** AI-002, AI-003.
- **Outcome:** The assistant is evaluated against representative questions and prohibited behaviors before being marked complete.
- **Acceptance criteria:**
  - [x] The evaluation set includes creator-story, product-material, size, care, recommendation, unsupported, and transaction-boundary questions.
  - [x] Expected answer properties are documented rather than relying only on subjective review.
  - [x] The assistant refuses or redirects questions about changing prices, totals, stock, or payment status.
  - [x] The assistant does not claim to be Jia Wei or present synthetic facts as verified reality.
  - [x] Evaluation results and known limitations are recorded.
- **Verification:** Ran the deterministic AI-004 matrix with 11 cases and a fake provider, including a retrieval-priority check that keeps the boundary document in price/stock/payment/identity context. Full backend tests passed with 52 tests. Frontend unit tests, build, lint, and Playwright desktop/mobile checks also passed. No external provider was configured for this run.
- **Likely files:** `backend/tests/ai/`, `docs/test-plan.md`, `docs/decisions/`.

## Phase 5 — Quality, security, and handoff

### QA-002 — Accessibility and responsive review

- **Status:** Completed and verified.
- **Depends on:** QA-001, AI-003.
- **Outcome:** The main product and assistant experiences are usable across mobile, desktop, keyboard, and common assistive-technology expectations.
- **Acceptance criteria:**
  - [x] Main navigation, product selection, cart, checkout, and assistant can be operated with keyboard input.
  - [x] Focus order and focus visibility are understandable.
  - [x] Form errors are associated with the relevant fields.
  - [x] Images have meaningful alternative text or intentional decorative treatment.
  - [x] Colour contrast is checked for text, controls, and focus states.
  - [x] No important action depends only on hover.
- **Verification:** Added `frontend/tests/accessibility.spec.ts` and ran 12 Playwright checks across Desktop Chrome and Pixel 5. Verified keyboard navigation through mobile menu, product selection, cart, checkout, and simulated payment; verified assistant validation/recovery and image alternative text. Measured small-text accent contrast and added the accessible `--color-creative-purple-ink` token. Frontend tests, build, and lint passed.
- **Likely files:** `frontend/src/`, `frontend/tests/`, `docs/test-plan.md`.

### SEC-001 — Review security, privacy, and demo boundaries

- **Status:** Completed and verified.
- **Depends on:** CHECKOUT-002, AI-002, QA-001.
- **Outcome:** The project visibly and technically maintains the learning-demo boundary.
- **Acceptance criteria:**
  - [x] No secrets or provider keys were added; the local `api key.txt` artifact is ignored without reading its contents.
  - [x] The browser never calls the AI provider directly.
  - [x] No real payment credentials are requested, stored, or logged.
  - [x] Backend validation protects product and total values.
  - [x] User and AI text are safely rendered as untrusted content.
  - [x] User-facing errors do not expose stack traces, secrets, provider details, or internal paths.
  - [x] CORS and deployment settings are documented as a required future step before external deployment.
- **Verification:** Added `backend/tests/test_security_boundaries.py`; the focused security checks passed and the full backend suite passed with 55 tests. Scanned frontend code for direct provider references and unsafe HTML rendering, scanned project files for secret-like values excluding the ignored local key artifact, and recorded the audit in `docs/decisions/security-review.md`.
- **Likely files:** backend configuration, `.gitignore`, `README.md`, `docs/architecture.md`, `backend/tests/`.

### DOC-001 — Synchronize documentation and prepare the portfolio handoff

- **Status:** Completed and verified.
- **Depends on:** QA-002, SEC-001, AI-004.
- **Outcome:** Another developer or potential client can understand the product, architecture, setup, limitations, and verification evidence.
- **Acceptance criteria:**
  - [x] README setup, run, test, and demo-boundary instructions are accurate.
  - [x] Requirements, architecture, task statuses, and test plan match the implemented behavior.
  - [x] Approved architecture decisions are recorded in `docs/decisions/`.
  - [x] Open questions are either resolved or clearly retained.
  - [x] The project explains that content, products, biography, and payment are synthetic learning-demo elements.
  - [x] The final handoff names known limitations and sensible next steps.
- **Verification:** Reviewed the README, requirements, architecture, task list, test plan, AI/security decision records, and added `docs/portfolio-handoff.md`. Re-ran the documented backend, frontend, build, lint, and browser checks in the current local environment.
- **Likely files:** `README.md`, `docs/`, `docs/decisions/`.

### DEPLOY-001 — Prepare deployment plan and deploy only with explicit confirmation

- **Status:** Completed and verified (deployment plan prepared; no public release performed).
- **Depends on:** DOC-001.
- **Outcome:** A deployment plan exists, and any external publishing action is performed only after the user explicitly requests it.
- **Acceptance criteria:**
  - [x] Frontend and backend hosting choices are documented.
  - [x] Environment variables and secret handling are documented without exposing values.
  - [x] HTTPS, CORS, error handling, and demo-payment messaging are checked for the target environment.
  - [x] No deployment or public release occurs as part of this task without explicit user confirmation.
- **Verification:** `docs/deployment-plan.md` records the Vercel + Render plan, exact-origin CORS boundary, environment-variable handling, SPA deep-link rewrite, release checklist, and rollback procedure. Frontend tests/build/lint and the backend suite pass after the deployment-readiness changes. No external service was connected.
- **Likely files:** `README.md`, `frontend/.env.example`, `frontend/vercel.json`, `frontend/src/config/`, `backend/.env.example`, `backend/app/main.py`, `backend/tests/`, `docs/deployment-plan.md`.

## First execution order

When the task list is approved, execute these tasks in order:

1. `SETUP-001` — Verify tools and create the skeleton.
2. `DATA-001` — Seed and validate the 13 products.
3. `API-001` — Expose the health and catalog API.
4. `UI-001` — Create the app shell and design tokens.
5. `UI-002` — Build the homepage story.
6. `UI-003` — Build the collection.
7. `UI-004` — Build product detail and options.
8. `CART-001` — Add cart behavior.
9. `CHECKOUT-001` — Add backend demo checkout validation.
10. `CHECKOUT-002` — Complete checkout and result UI.
11. `QA-001` — Verify VS-001 end to end.

Only after `QA-001` passes should the project continue to `AI-001`.

## Open questions that do not block VS-001

The following decisions can use safe provisional values while the first slice is built:

- Final brand name treatment: use `JW Studio` as the working label.
- Final logo and font pairing: use the approved typographic roles and a documented provisional pairing.
- Exact product names, materials, sizes, colours, and prices: use synthetic learning data, kept in one authoritative source.
- Demo checkout persistence: do not persist customer details by default.
- AI provider and model: use a provider adapter and a fake/stub provider for tests until selected.
- Hosting provider: defer until the local flow is stable.

Any choice that changes the user journey, data boundary, security posture, or architecture must stop the current task and be recorded for review.
