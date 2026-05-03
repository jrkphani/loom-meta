# 082 — Extraction discipline: confidence + source-grounding verification

**Workstream:** W16
**Tag:** AFK
**Blocked by:** #080, #081
**User stories:** none (hardens #010, #011, #012)

## Behaviour

Every extracted atom carries a confidence score (0.0–1.0). Below 0.6 surfaces in triage; below 0.4 is flagged in any brief that includes it. For prose extraction (Claude API tier), each atom's content must map to a contiguous span in source content via embedding similarity; atoms with no matching span are flagged as `unsupported` at extraction time, not after the fact. The thresholds are the §13.9 structural defences against hallucination.

## Acceptance criteria

- [ ] `loom_core/llm/extraction_discipline.py` exposes `ExtractedAtom` dataclass with `content`, `type`, `extraction_confidence`, `source_span_start`, `source_span_end`, `is_supported` fields.
- [ ] `CONFIDENCE_THRESHOLDS` constants module-level: `auto_accept = 0.85`, `triage_review = 0.6`, `flag_in_brief = 0.4`.
- [ ] `SourceGroundingVerifier` class wraps a sentence-transformers model (default `all-MiniLM-L6-v2`); configurable similarity threshold (default `0.7` per blueprint Open Question 27).
- [ ] `SourceGroundingVerifier.verify(atom_content, source_text, window_size=200)` returns `(is_supported, span_start, span_end)`; uses sliding-window cosine similarity over windowed embeddings of the source.
- [ ] Atom-extraction stages (post-#010, #011, #012 amendments) populate `extraction_confidence`, `source_span_start`, `source_span_end` per #076 schema.
- [ ] Atoms with `extraction_confidence < 0.6` are written but emit a `triage_items` row of type `low_confidence_atom`.
- [ ] Atoms where `verify()` returns `is_supported = False` for a Claude-tier extraction are written with `extraction_confidence` capped at 0.4 and flagged via triage.
- [ ] Brief composition (post-#035 amendment) adds a "verify before acting" annotation to atoms with `extraction_confidence < 0.4`.
- [ ] Unit tests: confidence threshold enforcement; source-grounding verifier with fixture (atom matching a span; atom not matching any span); flag-in-brief behaviour.
- [ ] All four CI gates pass.

## Notes

Per blueprint §13.9 and refactor plan §3.3, these are the **two structural defences against hallucination**:
1. Every atom carries an explicit confidence score; the threshold ladder (auto-accept / triage / flag-in-brief) is enforced at write time and read time.
2. Source-grounding via embedding similarity ensures Claude-extracted atoms can be traced to a contiguous span in the source content.

Source-grounding does not apply to Tier 1 (python_rules) atoms — those are deterministic and have direct source spans. It does apply to Tier 4 (claude_api) atoms and any future Tier 3 (apple_fm) prose extraction.

The 0.7 similarity threshold is the default per blueprint Open Question 27; tunable in `skills/routing-policy.yaml` once we have calibration data.

Window size of 200 chars with 50% overlap is the default for source-grounding; tunable per source type (transcripts may want 400; emails may want 150).

Sentence-transformers model loads once per process; not hot-reloaded. The model lives in the loom-core process; Apple FM tier (#067) gets its own model on the Swift side.

Refactor plan reference: §3.3 of `loom-meta/docs/v08-alignment-refactor-plan.md`. Blueprint reference: §13.9 and Open Question 27.

Lives in `loom-core/src/loom_core/llm/extraction_discipline.py`. Tests in `loom-core/tests/test_extraction_discipline.py`.
