# Approved architecture decisions

These records summarize the decisions in `docs/architecture.md` and the implementation status of the current learning slice.

## ADR-001 — React + TypeScript + Vite and FastAPI

Use React + TypeScript + Vite for the storefront and Python + FastAPI for the backend. This keeps frontend state, HTTP boundaries, validation, and AI integration visible to a student learning full-stack AI engineering.

## ADR-002 — Browser cart with backend transaction validation

The browser owns temporary cart state and recovery. The backend remains authoritative for product identity, options, prices, totals, and simulated payment results. AI output cannot mutate cart or checkout state.

## ADR-003 — RAG for explanations, structured data for transactions

RAG may explain the fictional creator story, brand, materials, care, sizing, FAQs, and recommendations. Product prices, totals, stock, order status, shipping, refunds, and payment status remain outside the model and come from approved application boundaries.

## ADR-004 — No demo customer-data persistence

The demo does not request or persist real payment credentials or unnecessary customer details. Checkout is synthetic and repeatable without creating a real order.

## ADR-005 — Keep current retrieval deterministic and dependency-free

The current small knowledge base uses lexical retrieval with an explicit boundary-document priority for commerce and creator-identity questions. A vector store or embedding pipeline may be evaluated later, but it is intentionally not added before the current deterministic behavior has a measured need.
