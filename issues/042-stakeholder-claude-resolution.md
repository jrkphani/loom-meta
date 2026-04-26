# 042 — Stakeholder resolution: Claude-tier disambiguation

**Workstream:** W8
**Tag:** AFK
**Blocked by:** #041
**User stories:** US-27, US-28

## Behaviour

For mentions that neither email-match nor fuzzy-match can resolve, the Claude tier is called with the mention in context (the sentence containing it, the event type and date, the list of known stakeholders) and asked to identify the most likely match or to say "unknown." Claude's recommendation is treated as a high-confidence triage item suggestion — Phani still confirms. This tier handles edge cases: abbreviations, initials, role-based references ("the AWS rep").

## Acceptance criteria

- [ ] `resolve_stakeholder_claude(mention: str, context: str, candidates: list[Stakeholder]) -> tuple[Stakeholder | None, str]` calls the Claude API with the mention + context + candidate list and returns the best match + reasoning.
- [ ] If Claude returns a match, a triage item is created with the match as the recommendation and `context_summary` showing Claude's reasoning.
- [ ] If Claude returns "unknown," a triage item is created with no candidate pre-filled.
- [ ] When the Claude API is unavailable, falls back to a triage item with no recommendation and a note "Claude unavailable."
- [ ] Unit tests mock the Claude client; test the match path, the unknown path, and the unavailable path.

## Notes

The Claude prompt should be brief: mention the context sentence, list ≤5 candidate names + emails, ask for the best match or "unknown". Keep token usage minimal since this call is per-mention.

Candidates are filtered to ≤5 by taking the top fuzzy matches from #041 (the ones below the 0.6 threshold, ranked by score).

The Claude tier is the last resort before the mention goes to the manual triage queue with no candidate. This is expected to be rare in a single-user system where the stakeholder list is well-maintained.
