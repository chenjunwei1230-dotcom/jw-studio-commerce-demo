# Product Brief

## Working title

Creator Commerce Demo — JW Studio 2.0

## Project intent

This is a fictional but realistic portfolio project. It simulates a freelance engagement for a Malaysian creator with roughly 20,000 followers.

The goal is to demonstrate that the developer can use Codex and professional engineering practices to discover a client problem, design a creator-specific brand experience, build a complete shopping journey, add a grounded AI feature, test the system, and prepare it for handoff.

## One-sentence product definition

An English-first merchandise storefront for a fictional Malaysian female lifestyle and editing educator, designed so her fans immediately recognize her story and visual identity while being able to browse products, ask questions, and complete a simulated purchase.

## Fictional creator profile

- Name: Jia Wei.
- Malaysian female lifestyle and tutorial creator.
- Optimistic, lively, approachable, and resilient.
- Spent about a year recovering at home after a leg injury.
- Used that time to learn video editing.
- Started posting small editing tips consistently.
- Continued posting even when early videos received little attention or criticism.
- Gradually grew to about 20,000 followers.
- Now wants to sell a small collection of creator-branded merchandise.

The detailed brand story, voice, and visual direction live in `docs/brand-bible.md`.

All creator details, images, social links, and product assets are synthetic learning materials unless replaced with permission from a real client.

## Target users

### Primary user

The creator's fans who want to understand the story, browse the collection, and buy a small piece of merchandise.

### Secondary user

Potential freelance clients or employers evaluating the developer's product, design, engineering, and AI integration skills.

## User problem

The creator needs a storefront that feels like an extension of her personality and content, not a generic e-commerce template. Fans need a clear, trustworthy way to learn about the creator and products before completing a purchase.

## Product inventory for the demo

- 5 small decorative items, such as keychains or similar accessories.
- 5 clothing products.
- 3 hats or headwear products.

Total planned catalog: 13 products.

## Core experience

1. A fan lands on a creator-specific homepage and understands who the creator is.
2. The fan explores the creator's story, editing journey, and merchandise collection.
3. The fan browses products, opens a product detail page, and adds an item to the cart.
4. The fan reviews the cart and enters demo checkout details.
5. The fan selects a simulated payment method.
6. The site shows a clearly labelled demo payment-success state.
7. At any point, the fan can ask an AI assistant about the creator, products, materials, sizing, or recommendations.

## AI feature direction

The first AI feature will be a grounded shopping and creator-information assistant using RAG.

The knowledge base may include:

- Creator biography and editing journey.
- Brand story and frequently asked questions.
- Product descriptions and materials.
- Size and care guidance.
- The creator's favourite products and recommendation reasons.

Product price, cart totals, checkout rules, and other transactional values must come from application data or APIs, not from generated text. RAG should help answer questions and explain recommendations, not act as the source of truth for payment or order calculations.

## Product principles

- Creator identity before generic commerce patterns.
- Mobile-first because most fans will arrive from social media.
- Clear before clever: the shopping journey must remain understandable.
- Synthetic data must be clearly treated as a learning demo.
- AI must be useful, grounded, transparent, and safe to fail.
- Every meaningful feature needs an observable acceptance criterion.

## Non-goals for version 2.0

- No real payment gateway or real card collection.
- No real order fulfilment, shipping integration, or inventory operations.
- No user login or account system unless later justified.
- No admin dashboard or multi-creator SaaS platform in the first release.
- No multilingual support in the first release; English only.
- No promise that the fictional creator represents a real person.

## Success signals

- A first-time visitor can identify the creator's story and visual identity within the first screen or two.
- A user can browse all 13 products and complete the simulated checkout without getting lost.
- The demo never implies that a real payment was processed.
- The AI assistant answers supported questions from the knowledge base and clearly handles unsupported questions.
- The experience works on mobile and desktop.
- The project can be explained and handed off using its requirements, architecture, tests, and README.

## Open questions

- What is the final logo and brand name treatment?
- What are the exact primary and secondary colors and font pairing?
- Confirmed visual direction: Frame by Frame Studio — a warm creator workspace inspired by video editing, progress, and creative practice.
- Should the first release include a real backend, or can the catalog and demo order flow begin with local application data?
- Which AI provider and API format will be used?
- What evidence will be used to evaluate the quality of the RAG assistant?
