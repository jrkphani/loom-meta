# 038 — Brief: Claude API narrative generation with template fallback

**Workstream:** W7
**Tag:** AFK
**Blocked by:** #035
**User stories:** US-20, US-22, US-37

## Behaviour

Each brief includes a Claude-generated narrative section: a 2–3 sentence executive summary that synthesises the hypothesis state, momentum signals, and open items into a recommendation for the meeting. When the Claude API is unreachable, the brief renders without the narrative section and includes a banner: "Narrative unavailable — Claude API unreachable. Template-only view." The next cron cycle retries.

## Acceptance criteria

- [ ] The engagement brief service calls Claude API with a prompt assembling hypothesis state + recent atoms + open items, and stores the narrative in the brief context dict before template rendering.
- [ ] When Claude API raises a connectivity error or rate-limit, the brief renders with `narrative: null` in the context and the template shows the fallback banner.
- [ ] The fallback brief is still fully usable: all hypothesis states, atoms, and open items are present — only the narrative paragraph is missing.
- [ ] `brief_runs.success = false` and `error_message` are set when the narrative generation fails.
- [ ] A test mocks the Claude client to raise a timeout; asserts the brief is written with the fallback banner and `brief_runs.success = false`.

## Notes

The narrative prompt should be minimal: hypothesis titles + current states + 3–5 most significant atoms (by confidence_sort_key). The response is plain text (1–3 sentences). Do not ask Claude to reproduce data already in the template.

The narrative is appended to the `## At a glance` section of the brief, not as a separate section.

Route: the narrative generation is internal to the brief service; no new API endpoint is needed.

Per PRD §9 (testing decisions): the Claude API is mocked at the SDK boundary in all non-external tests.

---

## v0.8 Alignment Addendum

**Depends on:** #080 (cognition router), #081 (adversarial input), #039 (audience profile)

The Claude narrative under v0.8 routes through `CognitionRouter.call_stage(stage='executive_narrative' | 'tactical_brief' | 'section_summaries', ...)`. The stage choice depends on the audience profile (#039): `executive` schema → `executive_narrative`; `technical` schema → `tactical_brief`; `aws_partner` schema → a partner-tailored stage.

### Additional acceptance criteria

- [ ] Calls go through `CognitionRouter`, not direct Anthropic SDK calls.
- [ ] When the brief is for a stakeholder with a defined `audience_schema`, the matching cognition stage is selected; default is `executive_narrative`.
- [ ] Atom contents passed to the narrative prompt are wrapped via `wrap_untrusted` (#081) since they originate from external sources.
- [ ] Privacy gate enforced: a brief whose atom set includes any `visibility_scope='private'` atom is composed via `apple_fm` only — even if the matrix would normally route to `claude_api`.
- [ ] When the privacy gate forces a downshift and Apple FM is unavailable, the brief renders with the existing template-only fallback (the original AC continues to hold).
- [ ] `provider_chain` field on `brief_runs` records every cognition stage + provider used during composition.

