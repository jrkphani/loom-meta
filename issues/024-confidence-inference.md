# 024 — State inference: confidence dimension (LLM tier)

**Workstream:** W5
**Tag:** AFK
**Blocked by:** #023
**User stories:** US-15, US-21

## Behaviour

The confidence inference engine calls the Apple AI sidecar (or Claude as fallback) to assess whether the hypothesis's confidence dimension should change, based on the recently attached atoms. It produces a proposal with a reasoning narrative and sets `confidence_inferred = true` on the proposal. Phani reviews the reasoning and either confirms (clearing `confidence_inferred`) or overrides. The reasoning is stored verbatim so it is auditable.

## Acceptance criteria

- [ ] The confidence inference engine sends attached atom contents + current confidence value to the LLM and asks for a recommendation (`low`, `medium`, `high`) with a one-paragraph reasoning.
- [ ] The response is parsed and a `hypothesis_state_changes` proposal is created with `dimension = confidence`, `changed_by = cron_inferred`, `reasoning = <LLM output>`.
- [ ] A triage item is created with `item_type = state_change_proposal` pointing to the hypothesis.
- [ ] `hypotheses.confidence_inferred` remains `true` until the user confirms or overrides via #006.
- [ ] When the Apple AI sidecar is unavailable, the engine falls back to Claude for the same call without failing.
- [ ] Unit tests mock the LLM client; a snapshot test asserts the proposal is created with reasoning populated.

## Notes

Confidence is interpretive: "How confident are we the hypothesis will prove true?" It is read from the current attached atoms' sentiment and any stakeholder cues.

The LLM prompt includes: hypothesis title, description, current confidence, and the 5 most recent attached atoms (content field only). Keep the prompt minimal to control cost.

Lives in `loom-core/src/loom_core/pipelines/inference/confidence.py`. Calls `loom_core.llm.apple_ai` (primary) or `loom_core.llm.claude` (fallback).

The reasoning stored in `hypothesis_state_changes.reasoning` should be plain English, not JSON. It is displayed verbatim in the triage UI and briefs.

---

## v0.8 Alignment Addendum

**Depends on:** #076 (schema), #080 (cognition router), #081 (adversarial input), #083 (forward provenance)

Under v0.8, confidence inference routes through `CognitionRouter.call_stage(stage='hypothesis_confidence', ...)`. The router applies the privacy gate: a hypothesis with private atoms cannot have its confidence inference go to claude_api; it stays on apple_fm or fails explicitly.

### Additional acceptance criteria

- [ ] Calls go through `CognitionRouter`, not direct LLM client calls.
- [ ] Atom contents passed in the prompt are wrapped via `wrap_untrusted` (#081) — atoms originate from external sources (transcripts, emails) and remain adversarial-input.
- [ ] The proposal row populates `inference_provider`, `inference_model_version`, `inference_skill_version`.
- [ ] If any of the 5 most recent attached atoms have `visibility_scope = 'private'`, the privacy gate ensures the inference call goes to apple_fm only; never claude_api.
- [ ] Retracted atoms are excluded from the prompt — confidence inference doesn't see hallucinated facts.
- [ ] `record_contribution(consumer_type='state_change')` writes for every atom included in the inference prompt (per #083).

