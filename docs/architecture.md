# Architecture

## Status

Approved for implementation. This architecture is based on the approved requirements. Material changes must be explained, reviewed, and recorded before implementation continues.

## Architecture goals

- Deliver the VS-001 browse-to-simulated-payment journey as a reliable vertical slice.
- Keep Jia Wei's product data, brand content, and UI rendering maintainable.
- Keep transaction-critical logic outside the browser and outside the AI model.
- Keep the AI assistant optional so the storefront remains usable when AI is unavailable.
- Make the project understandable to a freelance client or portfolio reviewer.
- Keep the design system expressive enough for Frame by Frame Studio without turning the UI into a complex editing application.

## Constraints

- This is a fictional learning and portfolio project.
- No real payment, shipping, inventory, authentication, or admin system is required.
- The first release is English-only and contains exactly 13 demo products.
- The developer is learning AI engineering and needs to understand the system rather than hide it behind excessive tooling.
- Synthetic content must not be presented as a real creator's verified biography.
- The hosting plan is resolved provisionally as Vercel for the frontend and Render for the backend; the AI provider and model remain open decisions.

## Proposed technology choices

| Area | Choice | Reason | Alternatives considered |
|---|---|---|---|
| Frontend | React + TypeScript + Vite | Builds reusable product, cart, form, and AI components while keeping the client-side application understandable. | Plain HTML/CSS/JS; Next.js |
| Routing | React Router | Supports the homepage, collection, product detail, cart, checkout, and result routes without duplicating page logic. | File-based routing in Next.js |
| Styling | CSS modules or scoped CSS plus CSS custom properties | Makes the Frame by Frame tokens, responsive rules, and component styles explicit and easier to learn. | Tailwind CSS |
| Frontend state | React state plus browser storage for the cart | The cart is a demo concern and does not require accounts or a global state library. | Redux; Zustand |
| Backend | Python + FastAPI | Fits the developer's AI engineering path and provides typed request validation and clear API boundaries. | Node.js + Express |
| Product data | SQLite seeded from structured product data | Gives the backend a source of truth for product facts and prices without requiring an admin system. | JSON-only catalog; PostgreSQL |
| Demo checkout | FastAPI validation with a synthetic result | Keeps price and option validation outside the browser without pretending to process a real payment. | Browser-only simulated checkout |
| RAG store | ChromaDB for the learning version | Makes the retrieval pipeline visible and practical for a small knowledge base. | In-memory search; hosted vector database |
| AI integration | Server-side provider adapter configured by environment variables | Keeps API keys out of the browser and allows the provider to change without rewriting the UI. | Direct browser-to-provider calls |
| Backend tests | pytest | Tests API validation, product lookup, totals, and AI fallback behavior. | unittest only |
| Frontend tests | Vitest for focused component or utility checks | Verifies cart calculations and rendering logic without requiring a full browser for every test. | Jest |
| User-flow tests | Playwright after VS-001 exists | Verifies the real browse-to-demo-checkout journey on desktop and mobile. | Manual testing only |
| Deployment | Vercel static frontend plus Render HTTPS FastAPI runtime | Matches the separation between the browser UI, protected API key, and backend validation while keeping deployment easy to inspect. | Single server deployment |

These choices are intentionally conservative. Do not add authentication, a state-management framework, a CMS, a payment SDK, or a hosted vector database unless a later requirement justifies it.

### Current AI retrieval implementation note

The current AI-002 through AI-004 learning slice uses deterministic in-memory lexical retrieval over the approved JSON knowledge documents. This keeps the retrieval boundary visible and dependency-free while the knowledge base is small. ChromaDB and embeddings remain a future upgrade option, not an unrecorded dependency in the current implementation.

## High-level system flow

```text
Fan browser
    │
    ├── Frontend routes and UI
    │       ├── Homepage / story
    │       ├── Collection / product detail
    │       ├── Cart / demo checkout
    │       └── AI assistant UI
    │
    └── HTTPS API
            ├── Product catalog → SQLite
            ├── Demo checkout → validate product/options/totals → synthetic result
            └── AI chat → retrieve approved context → LLM provider → safe response
```

## Core domain boundaries

### Storefront domain

Owns product browsing, product details, categories, cart state, and checkout presentation.

### Demo transaction domain

Owns validation of product IDs, selected options, prices, totals, and simulated payment status. It must not process real money or store real payment credentials.

### Creator content domain

Owns Jia Wei's fictional story, brand values, product explanations, FAQs, and approved voice.

### AI assistant domain

Owns retrieval, prompt construction, response handling, fallback behavior, and evaluation. It may explain or recommend, but it cannot mutate commerce state.

## Proposed data model

### Product

- `id`
- `name`
- `category`
- `price`
- `currency`
- `description`
- `materials`
- `sizes` or applicable options
- `colours` or applicable options
- `image`
- `design_meaning`
- `creator_recommendation`

### Cart item

- `product_id`
- selected options
- `quantity`
- price snapshot for display only

The application must re-read authoritative product data when validating checkout. A browser-supplied price is never trusted.

### Demo checkout request

Contains only the minimum demo information, selected product IDs and options, and a simulated payment method. It must not contain real card credentials.

### Demo checkout result

Contains a synthetic demo reference, validated line items, calculated total, and an explicit `demo_only` indicator.

### Knowledge document

Contains approved creator, brand, product, FAQ, sizing, care, and recommendation content for retrieval. Transaction values remain application data even when they are also described in knowledge documents.

## Proposed API surface

The exact schemas will be designed after this architecture is approved.

- `GET /api/health` — verify the backend is available.
- `GET /api/products` — return the 13 product records for browsing.
- `GET /api/products/{product_id}` — return one product or a not-found response.
- `POST /api/demo/checkout` — validate a demo checkout request, calculate totals from backend data, and return a synthetic result.
- `POST /api/ai/chat` — retrieve approved context and return a grounded assistant response.

The frontend must never call the AI provider directly. The AI API key and provider configuration belong behind the backend boundary.

## RAG flow

```text
User question
    ↓
Backend validates request size and basic input
    ↓
Retrieve relevant approved creator/product documents
    ↓
Construct a grounded prompt with explicit boundaries
    ↓
Call the configured AI provider from the backend
    ↓
Validate response shape and sanitize untrusted output
    ↓
Return answer plus optional source labels to the frontend
```

### RAG rules

- Use RAG for creator story, brand values, product explanations, materials, care, sizing, FAQs, and stated recommendations.
- Use structured product data or backend functions for product IDs, prices, totals, and simulated payment status.
- If retrieval does not provide enough evidence, return an honest fallback instead of guessing.
- The assistant must not claim to be Jia Wei.
- The first version does not need tool calling or multi-agent orchestration.

## Trust boundaries

### Browser boundary

The browser is untrusted. It may display and request data, but it must not be the authority for prices, totals, payment status, or permissions.

### Backend boundary

The backend validates requests, reads authoritative product data, calculates demo totals, protects the AI API key, and controls the AI fallback behavior.

### AI provider boundary

The external provider receives only the question and approved context required for the assistant. No real payment credentials, API keys, or unnecessary personal data should be sent to it.

## Failure behavior

- Product API unavailable: show a clear error state with retry guidance; do not render fabricated product data.
- Product not found: show a not-found state with a route back to the collection.
- Invalid checkout data: return a validation response tied to the relevant field or item.
- Client-supplied total differs from the backend calculation: reject or ignore the client total and use the backend calculation.
- AI provider unavailable: keep the storefront and checkout usable; show a concise assistant fallback.
- Retrieval returns weak or no evidence: say that the assistant does not have enough information.
- AI response is malformed or unsafe to render: show a safe fallback and log a diagnostic event without exposing internals.
- Image fails: show an accessible fallback with product name and keep the product usable.

## Privacy and security design

- Store API credentials only in protected backend environment configuration.
- Use HTTPS in deployed environments.
- Configure CORS for known frontend origins rather than allowing every origin by default.
- Do not collect card numbers, CVV, bank passwords, or real payment data.
- Prefer not to persist demo customer details. If persistence is later added, document retention and cleanup first.
- Validate product IDs, options, quantities, and totals on the backend.
- Treat user questions, product text, and AI responses as untrusted content before rendering.
- Do not expose stack traces, provider errors, secrets, or internal file paths to users.

## Proposed repository structure

```text
JW studio 2.0/
├─ AGENTS.md
├─ README.md
├─ docs/
│  ├─ product-brief.md
│  ├─ brand-bible.md
│  ├─ requirements.md
│  ├─ architecture.md
│  ├─ task-list.md
│  ├─ test-plan.md
│  └─ decisions/
├─ frontend/
│  ├─ src/
│  │  ├─ app/
│  │  ├─ components/
│  │  ├─ features/
│  │  ├─ pages/
│  │  ├─ data/
│  │  └─ styles/
│  └─ public/
└─ backend/
   ├─ app/
   │  ├─ api/
   │  ├─ domain/
   │  ├─ services/
   │  └─ main.py
   ├─ data/
   └─ tests/
```

The exact folders may change during implementation if a smaller structure proves clearer.

## Implementation order after approval

1. Project tooling and verified run commands.
2. Backend health and product catalog endpoint.
3. Frontend shell, navigation, and Frame by Frame design tokens.
4. Collection and product detail flow.
5. Cart state and totals.
6. Demo checkout validation and synthetic result.
7. VS-001 browser test on desktop and mobile.
8. Knowledge base and RAG assistant.
9. AI evaluation set and fallback tests.
10. Security, accessibility, documentation, and deployment checks.

The AI assistant is deliberately after VS-001. The core commerce journey must be independently reliable first.

## Architecture decisions to record

- ADR-001: Choose a React + TypeScript frontend and FastAPI backend for a small full-stack learning project.
- ADR-002: Keep cart state in the browser but validate product and totals on the backend.
- ADR-003: Use RAG for explanatory knowledge and structured data for transactional truth.
- ADR-004: Do not persist demo customer information by default.

These decisions should become short records in `docs/decisions/` if the architecture is approved.

## Open architecture questions

- Which frontend and backend hosting providers will be used?
- Which AI provider and model will be used?
- Should the first catalog source be SQLite immediately, or should a JSON seed file be used during VS-001 and migrated to SQLite afterward?
- Should the demo checkout run fully through the backend from the first slice?
- What image and performance targets should be measured in the release checklist?
