# 011 — Atom extractor: Apple AI tier

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #010, #068
**User stories:** US-1, US-2, US-36

## Behaviour

High-volume, quality-tolerant extraction tasks (tagging, summarisation, domain classification) are routed to the Apple AI sidecar rather than the Claude API. The Loom Core Apple AI client calls the sidecar endpoints for summarise and extract-tags. If the sidecar is unavailable, the client falls back to the Claude API for the same task. This tier does not perform primary atom extraction (that stays on Claude); it handles the supplementary tasks that produce `source_metadata` enrichments and atom confidence scores.

## Acceptance criteria

- [ ] After Claude extraction runs, the Apple AI tier calls `POST /v1/summarize` on the sidecar to produce `body_summary` for the event if not already set.
- [ ] The Apple AI tier calls `POST /v1/extract-tags` to produce tag suggestions for the event (stored as entity_tags once #026 exists; for now, logged and discarded).
- [ ] When the Apple AI sidecar returns a non-200 response or times out, the Loom Core client falls back to Claude for the same task without crashing.
- [ ] The fallback is logged at WARNING level with the failure reason.
- [ ] Service tests mock both the sidecar HTTP client and the Claude fallback client; test both the happy path and the fallback path.

## Notes

Depends on #068 (Loom Core Apple AI HTTP client) from W12. If W12 is not yet done, stub the client with a `NotImplementedError` or a config flag `apple_ai.enabled = false`. The extractor must degrade gracefully when the sidecar is absent.

The Apple AI client lives in `loom-core/src/loom_core/llm/apple_ai.py` (created in #068). This issue wires it into the extraction pipeline.

LLM routing principle (PRD §6.1): "Anything user-visible at quality → Claude; high-volume / quality-tolerant → Apple AI."

Pipeline location: `loom-core/src/loom_core/pipelines/extractor_apple_ai.py`.
