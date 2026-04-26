# 025 — State inference: momentum dimension (LLM tier)

**Workstream:** W5
**Tag:** AFK
**Blocked by:** #023
**User stories:** US-15, US-21

## Behaviour

Momentum captures velocity: "Is this hypothesis accelerating, holding steady, slowing, or stalled?" The LLM is given the recent atom timeline (with dates) and asked to assess direction of travel. Like confidence, momentum proposals are inferred-until-reviewed. The distinction from confidence: momentum looks at the rate of change over time, not the current state.

## Acceptance criteria

- [ ] The momentum inference engine produces a proposal with `dimension = momentum`, `changed_by = cron_inferred`, and reasoning explaining the velocity reading.
- [ ] The LLM prompt includes: hypothesis title, current momentum, and the last 10 attached atoms with their `created_at` timestamps (ordered chronologically) to surface the pace.
- [ ] Triage item is created with `item_type = state_change_proposal` pointing to the hypothesis.
- [ ] `hypotheses.momentum_inferred` remains `true` until confirmed or overridden via #006.
- [ ] The engine handles a hypothesis with < 3 attached atoms gracefully: proposes `steady` with reasoning "insufficient signal to assess momentum".
- [ ] Apple AI fallback to Claude works the same as in #024.
- [ ] Unit tests use fixture atoms with timestamps spanning 2+ weeks; assert a `slowing` or `stalled` proposal when no atoms were added in the last 7 days.

## Notes

Momentum values: `accelerating`, `steady`, `slowing`, `stalled`.

The key difference from confidence: the LLM needs atom timestamps to assess velocity, not just content. Include `created_at` in the atom list passed to the prompt.

Lives in `loom-core/src/loom_core/pipelines/inference/momentum.py`.

The three inference engines (progress, confidence, momentum) are run sequentially per hypothesis during the `state_inference` cron job (#026), not in parallel, to avoid concurrent writes to the same `hypotheses` row.
