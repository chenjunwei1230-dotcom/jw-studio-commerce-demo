# JW Studio 2.0 — Frontend

The modern web storefront for JW Studio, featuring the **Frame by Frame** visual design system, creator scrollytelling, synthetic catalog browse, cart management, simulated checkout flow, and grounded AI assistant integration.

## Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router v7
- **Styling:** Vanilla CSS with custom design tokens (`src/styles/tokens.css`, `global.css`, `App.css`)
- **Typography:** Montserrat (Display / Headings), Inter (Body), JetBrains Mono (Meta / Eyebrows) via Google Fonts
- **Linting & Code Quality:** Oxlint
- **Testing:** Vitest (Unit / Integration) & Playwright (End-to-End browser tests)

## Directory Structure

```
frontend/
├── public/                 # Favicon and static product assets
├── src/
│   ├── app/                # AppShell, navigation, layout wrappers
│   ├── config/             # Environment and API base configuration
│   ├── features/
│   │   ├── assistant/      # Grounded AI assistant panel and chat API
│   │   ├── cart/           # Cart context, hooks, and local storage
│   │   ├── catalog/        # Product grid, product card, and catalog API
│   │   ├── creator/        # Homepage scrollytelling and brand story visuals
│   │   └── products/       # Product details, options, swatch selector
│   ├── pages/              # Route pages (Home, Shop, Detail, Cart, Checkout, DemoResult)
│   └── styles/             # Design tokens, global rules, shell styles
└── tests/                  # Playwright E2E and accessibility specs
```

## Available Scripts

From `frontend/`:

```powershell
# Start local development server
npm run dev

# Run unit and feature tests
npm test

# Run Oxlint linting check
npm run lint

# Build production bundle with TypeScript check
npm run build

# Run end-to-end tests (requires local backend running)
npm run test:e2e
```

For root architecture decisions, security reviews, and backend integration instructions, see the root [`README.md`](../README.md) and [`docs/`](../docs/).
