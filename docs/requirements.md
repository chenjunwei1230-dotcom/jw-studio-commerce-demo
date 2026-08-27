# Requirements

## Document status

Approved for implementation. These requirements are derived from `docs/product-brief.md` and `docs/brand-bible.md`. Any material scope change must be recorded as an open question or decision before implementation.

## Product boundary

JW Studio 2.0 is a fictional, English-first merchandise storefront for Jia Wei, a Malaysian lifestyle and beginner video-editing educator with an audience of approximately 20,000 followers.

The storefront uses the confirmed **Frame by Frame Studio** direction: a warm creator workspace inspired by video frames, progress, editing practice, and creative persistence.

The product is a learning demo. Payments are simulated and no real transaction is processed.

## Users and scenarios

### Primary user: Jia Wei's fan

The fan arrives from social media, wants to understand Jia Wei's story, explores the merchandise, asks questions, and completes a simulated purchase.

### Secondary user: portfolio reviewer or potential client

The reviewer evaluates whether the site feels creator-specific, whether the commerce journey is complete, and whether the AI feature is grounded and responsibly implemented.

### Scenario A — Discover the creator

A new visitor lands on the homepage and wants to know who Jia Wei is, what she teaches, and why the merchandise exists.

### Scenario B — Browse and compare products

A fan wants to explore the 13-product collection, filter or scan categories, open product details, and compare price, materials, options, and design meaning.

### Scenario C — Ask for help

A fan is unsure which product suits them and asks the AI assistant about Jia Wei's recommendations, product materials, sizing, care, or story.

### Scenario D — Complete a demo purchase

A fan selects a product, adds it to the cart, enters demo checkout details, selects a simulated payment method, and sees a clearly labelled demo success result.

### Scenario E — Recover from a problem

A fan encounters an empty cart, invalid checkout data, missing product information, unavailable AI service, or a failed demo action and receives a clear next step.

## Main user journey

1. Visitor arrives from a social link.
2. Visitor recognizes Jia Wei and the Frame by Frame Studio identity.
3. Visitor reads the creator story and sees the merchandise entry point.
4. Visitor opens the shop and browses 13 products.
5. Visitor opens a product detail page and selects available options.
6. Visitor adds the product to the cart.
7. Visitor reviews the cart and proceeds to demo checkout.
8. Visitor enters only the information required by the demo.
9. Visitor selects a clearly simulated payment option.
10. Visitor sees a demo payment-success state with the order summary.

The AI assistant is available during browsing and can support discovery, but it is not required to complete checkout.

## Page and surface list

### P-001 — Homepage

Must communicate Jia Wei's story, the Frame by Frame Studio identity, the merchandise purpose, and the main path to the collection.

### P-002 — Shop / Collection

Must display the 13-product collection with category information and a clear path to product details.

### P-003 — Product detail

Must display the selected product's image, name, price, description, materials, options, design meaning, and add-to-cart action.

### P-004 — Cart

Must display selected products, options, quantities if supported, subtotal, and a path to checkout.

### P-005 — Demo checkout

Must collect only the minimum information needed for the learning flow and show that payment is simulated.

### P-006 — Demo payment result

Must clearly state that the payment is a demo and show the selected product and simulated order summary.

### P-007 — AI assistant surface

The AI assistant may be embedded on the homepage or shop page rather than implemented as a separate page. Its location must not interrupt the primary shopping journey.

### P-008 — Shared states

All relevant pages must support loading, empty, error, not-found, and recovery states.

## Functional requirements

### FR-001 — Creator identity and homepage story

User story: As a new visitor, I want to understand Jia Wei and her journey quickly, so that the store feels personal and trustworthy.

Acceptance criteria:

- [ ] The homepage identifies Jia Wei as a Malaysian lifestyle and editing educator.
- [ ] The homepage communicates her journey from injury recovery to learning editing and consistently sharing content.
- [ ] The page expresses the core belief that continuing the journey has value even when success is uncertain.
- [ ] The Frame by Frame Studio visual direction is visible through creator-specific imagery, labels, or visual motifs.
- [ ] The homepage includes a clear route to the collection.
- [ ] Synthetic demo content is not presented as a real person's biography.

### FR-002 — Site navigation

User story: As a visitor, I want to move between the story, collection, cart, and AI assistant, so that I can complete my goal without getting lost.

Acceptance criteria:

- [ ] Navigation exposes the most important destinations without overwhelming the user.
- [ ] The current page or section is understandable on desktop and mobile.
- [ ] The cart entry shows whether products have been added.
- [ ] Navigation remains usable without relying only on hover interactions.
- [ ] Mobile navigation can be opened and closed using touch and keyboard input.

### FR-003 — Product catalog

User story: As a fan, I want to browse the complete collection, so that I can find an item that fits my interests and budget.

Acceptance criteria:

- [ ] The catalog contains exactly 13 demo products for the first release.
- [ ] The catalog contains 5 small decorative items, 5 clothing items, and 3 hats or headwear items.
- [ ] Every product has a stable identifier, name, category, price, image, description, and available options.
- [ ] Products are rendered from structured product data rather than duplicated page markup.
- [ ] The user can open each product's detail view.
- [ ] The catalog presents prices consistently and clearly.

### FR-004 — Product detail and options

User story: As a fan, I want to understand a product before adding it to my cart, so that I can make an informed choice.

Acceptance criteria:

- [ ] The detail view shows the selected product's image, name, price, description, material, and design meaning when available.
- [ ] Clothing products show relevant size and colour options.
- [ ] Headwear and decorative items show the relevant options for that product.
- [ ] The user cannot add a product when a required option has not been selected.
- [ ] The page provides a clear way to return to the collection.
- [ ] Missing optional product information is handled gracefully instead of displaying broken labels.

### FR-005 — Cart management

User story: As a fan, I want to review and adjust my selected products, so that I can confirm my demo order before checkout.

Acceptance criteria:

- [ ] A valid product selection can be added to the cart.
- [ ] The cart shows product name, selected options, quantity if supported, unit price, and subtotal.
- [ ] The user can remove an item from the cart.
- [ ] The subtotal is calculated from application product data.
- [ ] The cart is empty by default and has a clear route back to shopping.
- [ ] Cart state does not depend on an AI-generated answer.

### FR-006 — Demo checkout form

User story: As a fan, I want to enter the minimum information required for a demo order, so that I can experience a complete checkout flow.

Acceptance criteria:

- [ ] Checkout clearly states that it is a learning demo and not a real purchase.
- [ ] The form collects only the information justified by the demo flow.
- [ ] Required fields are identified before submission.
- [ ] Invalid or incomplete values produce clear, human-readable messages.
- [ ] The user can return to the cart before confirming the demo.
- [ ] No real card number, CVV, bank password, or other payment credential is requested.

### FR-007 — Simulated payment

User story: As a learner or reviewer, I want to see a complete payment interaction without processing real money, so that I can evaluate the whole user journey safely.

Acceptance criteria:

- [ ] The user can choose from clearly labelled simulated payment options.
- [ ] The interface does not connect to a real payment gateway.
- [ ] The interface does not collect real payment credentials.
- [ ] The confirmation action is labelled as a demo or simulation.
- [ ] A successful demo leads to the demo payment-result surface.
- [ ] The result page states that no real payment was processed.

### FR-008 — Demo payment result

User story: As a fan, I want confirmation after completing the simulated flow, so that I know the demo journey is complete.

Acceptance criteria:

- [ ] The result page displays a clear demo-success message.
- [ ] The page shows the selected product and simulated order summary.
- [ ] The page does not imply real fulfilment, shipping, or payment processing.
- [ ] The user can return to the shop.
- [ ] Refreshing or revisiting the result does not create a real order or charge.

### FR-009 — Grounded AI assistant

User story: As a fan, I want to ask questions about Jia Wei and the collection, so that I can choose products with more confidence.

Acceptance criteria:

- [ ] The assistant can answer supported questions about Jia Wei's fictional story and values.
- [ ] The assistant can answer supported questions about product descriptions, materials, sizes, care, and design meaning.
- [ ] The assistant can explain Jia Wei's stated favourite products or recommendation reasons when those facts exist in the knowledge base.
- [ ] The assistant does not claim to literally be Jia Wei.
- [ ] The assistant does not invent product availability, payment status, prices, or order totals.
- [ ] The assistant can state that it does not have enough information.
- [ ] The assistant's unavailable or failed state gives the user a useful next step.
- [ ] The AI feature is optional; users can browse and complete the demo checkout without it.

### FR-010 — Product and transaction source of truth

User story: As the product owner, I want transaction-critical values to come from application data, so that AI output cannot change the result of a purchase flow.

Acceptance criteria:

- [ ] Product prices come from structured application data or an API.
- [ ] Cart totals are calculated by application logic.
- [ ] Simulated payment status is controlled by application logic.
- [ ] The AI assistant cannot write or alter cart totals, payment status, or order values.
- [ ] Any future backend order endpoint validates important values server-side.

### FR-011 — English content

User story: As a fan, I want a consistent English experience, so that the site feels coherent in the first release.

Acceptance criteria:

- [ ] All user-facing navigation, product, form, error, and AI interface copy is in English.
- [ ] The tone follows Jia Wei's friendly, clear, encouraging voice.
- [ ] No language selector is included in the first release.
- [ ] Placeholder copy is not left in the final demo path.

## Error, empty, and loading states

### Loading states

- [ ] Product catalog loading state is visible without showing broken layout.
- [ ] Product detail loading state explains that content is being loaded.
- [ ] AI response loading state prevents accidental duplicate submissions and communicates that the assistant is working.
- [ ] Checkout submission state prevents repeated confirmation actions.

### Empty states

- [ ] Empty cart state explains that no products have been selected and provides a route back to shopping.
- [ ] Empty catalog state explains that no products are currently available and provides recovery guidance.
- [ ] Empty AI knowledge result explains that the assistant does not have enough information.

### Error states

- [ ] Invalid checkout input identifies what needs to be corrected.
- [ ] Missing product or invalid product ID has a clear not-found state and a route back to the collection.
- [ ] Failed product loading provides retry or recovery guidance.
- [ ] AI API failure does not expose API keys, stack traces, or internal error details.
- [ ] Simulated payment failure, if implemented, explains that no real payment occurred and lets the user retry or return to the cart.

## Mobile and desktop requirements

### Mobile-first

- [ ] The main browse-to-checkout journey works on a narrow mobile viewport.
- [ ] Primary controls are comfortable to tap and not dependent on hover.
- [ ] Product cards remain readable without excessive horizontal scrolling.
- [ ] Images, product names, prices, and actions remain visually ordered.
- [ ] Mobile navigation can be opened, closed, and escaped.
- [ ] AI chat remains usable with a mobile keyboard visible.

### Desktop

- [ ] The layout uses available space without making product information difficult to scan.
- [ ] Product browsing, cart review, and checkout remain visually connected.
- [ ] The Frame by Frame visual system is visible without excessive decorative UI.
- [ ] Hover effects, if used, supplement rather than replace important actions.

### Accessibility baseline

- [ ] Interactive controls have meaningful accessible names.
- [ ] Text and controls have sufficient contrast, to be verified during implementation.
- [ ] Keyboard users can navigate the main journey.
- [ ] Product images have useful alternative text.
- [ ] Error messages are associated with the relevant fields or content.

## RAG AI assistant boundaries

### Allowed knowledge

- Jia Wei's fictional biography and editing journey.
- Jia Wei's brand values and core belief.
- Product descriptions, materials, sizes, colours, care guidance, and design meaning.
- Stated favourite products and recommendation reasons.
- Approved frequently asked questions.

### Not allowed

- Inventing products, prices, stock, shipping promises, or personal facts.
- Deciding whether payment succeeded.
- Calculating or changing cart totals.
- Claiming to be Jia Wei.
- Presenting synthetic biography details as verified real-world facts.

### AI trust behavior

- [ ] The assistant gives a concise answer grounded in the approved knowledge base.
- [ ] The assistant indicates uncertainty when retrieval does not provide enough evidence.
- [ ] The assistant uses a friendly but not aggressive sales tone.
- [ ] The assistant has a visible or documented fallback when the AI service is unavailable.
- [ ] A test set of representative questions is defined before the AI feature is marked complete.

## Security and privacy requirements

- [ ] AI API keys and service credentials are kept on the server or in protected environment configuration, never in browser code or committed files.
- [ ] The demo never requests real payment credentials.
- [ ] Checkout data collection is minimized and clearly described as demo-only.
- [ ] If demo customer data is stored, the retention and cleanup behavior is documented.
- [ ] Important product and transaction values are validated outside the browser.
- [ ] User-provided text and AI-generated text are treated as untrusted content before rendering.
- [ ] Internal exceptions, stack traces, secrets, and provider details are not shown to end users.
- [ ] External links and synthetic social profiles are clearly treated as demo content.

## Non-functional requirements

- Maintainability: Product data, brand content, and UI copy should be changeable without duplicating page markup.
- Reliability: The core browse-to-demo-checkout journey should remain usable when the AI service is unavailable.
- Performance: Images should be appropriately sized and lazy-loaded where suitable; exact targets are an open question.
- Accessibility: Meet the accessibility baseline above and verify it during browser testing.
- Responsiveness: Support mobile and desktop layouts before release.
- Observability: Errors in the AI and checkout flows should be diagnosable without exposing sensitive details to users.
- Documentation: README, product brief, requirements, architecture, task list, and test plan must stay synchronized.

## Non-goal features

- Real payment gateway or real card collection.
- Real shipping, fulfilment, or inventory management.
- User accounts, login, or registration.
- Admin dashboard or CMS.
- Multi-creator SaaS platform.
- Multilingual UI.
- Real email, SMS, or WhatsApp order notifications.
- Production analytics or advertising tracking.
- Advanced personalization, social login, loyalty points, reviews, or subscriptions.

## First vertical slice

### VS-001 — Browse to simulated payment result

Goal: Prove that the most important user journey works end to end before adding the AI assistant or advanced polish.

Flow:

1. Open the homepage.
2. Recognize Jia Wei and the Frame by Frame Studio identity.
3. Open the collection.
4. Open one product detail page.
5. Select any required product options.
6. Add the product to the cart.
7. Open the cart and verify the product and subtotal.
8. Proceed to demo checkout.
9. Submit valid demo details without entering payment credentials.
10. Select a simulated payment option.
11. Confirm the demo.
12. See the clearly labelled demo payment-success result.

Acceptance criteria:

- [ ] The complete flow works on mobile and desktop.
- [ ] Product information and subtotal remain consistent throughout the flow.
- [ ] Invalid required inputs block progress with clear messages.
- [ ] Empty cart recovery works.
- [ ] No real payment or sensitive payment data is requested.
- [ ] The result page clearly states that no real payment was processed.
- [ ] The flow can be repeated without creating a real transaction.

The AI assistant is intentionally excluded from VS-001 so the core commerce experience can be verified independently.

## Open questions

- What is the final brand name treatment: Jia Wei Studio, JW Studio, or another fictional name?
- What is the final logo and font pairing?
- Should the first vertical slice use local product data only, or a simple backend from the beginning?
- Will demo checkout data be stored at all, or remain only in the browser session?
- Which AI provider and API format will be used?
- What retrieval method and evaluation approach will be used for RAG?
- What are the exact product names, materials, sizes, colours, and prices?
- What are the measurable image-loading and page-performance targets?
