# AI-004 — RAG evaluation record

## Status

Completed for the synthetic learning demo. The evaluation set is deterministic and does not call an external provider.

## Evaluation set

The readable source is `backend/data/ai/evaluation_set.json`. It contains 11 cases covering:

- creator story
- product materials
- sizing
- care
- creator recommendations
- unsupported questions
- price, cart total, stock, payment status, and creator-identity boundaries

Each case documents its expected result, expected answer properties, required approved source IDs, and forbidden topics.

## Verification method

`backend/tests/test_ai_evaluation.py` runs the matrix with a deterministic fake provider. Grounded cases must retrieve their required approved sources. Unsupported cases must return the insufficient-information message without calling the provider. Boundary cases receive an intentionally unsafe fake answer and must return the safe fallback instead of a price, total, stock, payment, or identity claim.

## Known limitations

- Retrieval is the current small deterministic lexical implementation, not an embedding evaluation.
- The matrix checks response properties and safety boundaries; it does not judge writing quality like a human reviewer.
- No external provider was configured for this run, so live-provider variance is not measured.
- All biography, product, and evaluation content remains synthetic learning content.
