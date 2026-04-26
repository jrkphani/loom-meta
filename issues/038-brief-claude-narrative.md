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
