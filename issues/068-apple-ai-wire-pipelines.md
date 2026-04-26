# 068 — Apple AI: wire W3, W5, and W9 pipelines to Apple AI tier

**Workstream:** W12
**Tag:** AFK
**Blocked by:** #067, #010
**User stories:** US-1, US-5, US-36

## Behaviour

The three extraction pipelines (W3 inbox extractor, W5 state inference, W9 migration pre-pass) are updated to call the Apple AI client (#067) for their qualifying tasks: summarise, extract-tags, classify-domain, clean-note. Claude remains the primary for prose atom extraction and reasoning. This issue wires the routing logic so the correct tier is chosen per task.

## Acceptance criteria

- [ ] `extractor_apple_ai.py` (from #011) now correctly calls `AppleAIClient.summarize()` and `AppleAIClient.extract_tags()` for every event post-extraction.
- [ ] The W5 inference engines (#024, #025) call `AppleAIClient` (primary) with `ClaudeClient` fallback for confidence and momentum reads.
- [ ] The W9 migration classify+prepass stage (#045) calls `AppleAIClient.classify_domain()` and `AppleAIClient.clean_note()`.
- [ ] When `apple_ai.enabled = false` in config, all three pipelines skip the sidecar calls and route to Claude or skip (as appropriate per task).
- [ ] All existing tests for W3, W5, W9 still pass (the Apple AI client is mocked in those tests).
- [ ] A new service test for each pipeline verifies the routing logic with both `enabled = true` (mock sidecar) and `enabled = false` (skip sidecar).

## Notes

This is a wiring issue — no new business logic. The pipelines already have stub calls to the Apple AI client from their respective issues (#011, #024, #025, #045). This issue makes those stubs real by injecting a real `AppleAIClient` (or its mock in tests).

The routing decision per task (Apple AI vs Claude vs skip) follows the operations classification matrix in `loom-system-design-v1.md §13`:
- Summarise, tag extract, classify, clean → Apple AI primary, Claude fallback
- Atom extraction, reasoning, disambiguation (complex) → Claude primary, no Apple AI
