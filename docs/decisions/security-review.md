# SEC-001 — Security and demo-boundary review

## Status

Completed for the local synthetic learning demo. No external deployment or real provider call was performed.

## Verified boundaries

- The frontend calls only `/api/ai/chat`; provider URL, model, and API key configuration exist only in the backend environment example.
- AI answers are rendered as React text. The frontend does not use `dangerouslySetInnerHTML` or `innerHTML` for user or provider content.
- The backend validates product IDs, options, quantities, prices, and totals outside the browser.
- Checkout accepts only the approved synthetic payment methods and rejects card numbers, CVV, bank passwords, and customer fields.
- The AI prompt, retrieval boundary, provider output validator, and deterministic evaluation set block or redirect price, total, stock, payment, shipping, refund, order, and private-creator claims.
- Product, checkout, and AI failure responses do not expose stack traces, provider errors, API keys, or internal paths.
- The local `api key.txt` artifact was not read. It is explicitly ignored by `.gitignore` to reduce accidental tracking risk.

## Deployment note

No CORS or deployment settings are enabled in this local task. A future deployment task must choose HTTPS origins, add a narrow CORS allowlist, configure protected backend environment variables, and verify that no secret enters frontend assets.

## Known limitations

- This review is a repository and test audit; it is not a production penetration test.
- The project folder does not contain Git metadata in the current workspace, so tracked-history inspection is not available here.
- Provider configuration remains optional and provider-specific live behavior still needs a separately approved test with synthetic credentials.
