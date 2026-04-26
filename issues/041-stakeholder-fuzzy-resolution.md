# 041 — Stakeholder resolution: fuzzy name matching

**Workstream:** W8
**Tag:** AFK
**Blocked by:** #040
**User stories:** US-27, US-28

## Behaviour

When email exact-match fails, the resolution pipeline tries fuzzy name matching. Free-text mentions like "Madhavan said..." are matched against `canonical_name` and `aliases` using `rapidfuzz` token-ratio similarity. High-similarity matches (≥ 0.85) resolve automatically; medium-similarity (0.6–0.85) create a triage item with the top candidate; low-similarity (< 0.6) are sent to the Claude tier (#042). Embedding similarity (sentence-transformers) is used as a second signal when rapidfuzz is ambiguous.

## Acceptance criteria

- [ ] `resolve_stakeholder_fuzzy(mention: str) -> tuple[Stakeholder | None, float]` returns the best match and its similarity score.
- [ ] Similarity ≥ 0.85 → resolved (returned, no triage item).
- [ ] Similarity 0.6–0.84 → `None` returned + triage item created with `context_summary` including the top candidate name.
- [ ] Similarity < 0.6 → `None` returned, falls through to Claude tier (#042).
- [ ] The function uses `rapidfuzz.fuzz.token_sort_ratio` for name matching and `sentence_transformers` (model: `all-MiniLM-L6-v2`) for embedding similarity.
- [ ] Unit tests: exact fuzzy match ("Madhav" → "Madhavan R"), partial match below threshold, no match.

## Notes

`rapidfuzz>=3.10` and `sentence-transformers>=3.3` are already dependencies.

The embedding similarity is used as a tiebreaker when two candidates have similar token ratios. Load the sentence-transformer model once at startup (as a FastAPI lifespan resource) to avoid repeated model loading.

Fuzzy matching is applied to `canonical_name` and each element of `aliases`. The best score across all fields is used.
