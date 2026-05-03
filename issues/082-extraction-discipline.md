# 082 — Extraction discipline: confidence + source-grounding verification

**Workstream:** W16
**Tag:** AFK
**Blocked by:** #076, #080, #081
**User stories:** US-1, US-25 (atom extraction quality)

## Behaviour

Two structural defences against atom hallucination, per blueprint §13.9:

1. **Extraction confidence.** Every extracted atom carries a confidence score in [0, 1]. Confidence ≥ 0.85 auto-attaches to the engagement. Confidence ∈ [0.6, 0.85) surfaces in triage. Confidence < 0.6 surfaces in triage with an "uncertain extraction" flag. Confidence < 0.4 is flagged in any brief that includes the atom: "verify before acting."

2. **Source grounding.** For prose extraction (Claude tier), each atom's content must map to a contiguous span in the source content via embedding similarity. The verifier finds the best-matching window in the source; if the cosine similarity falls below the threshold (default 0.7), the atom flags as `is_supported=False` at extraction time. Atoms with no source grounding never auto-attach.

Both checks fire at extraction time, before the atom is persisted. Rules-tier extraction (#012 amendment) is exempt from source-grounding verification because the parse itself is structural grounding.

## Acceptance criteria

- [ ] `loom_core/llm/extraction_discipline.py` is created with: `CONFIDENCE_THRESHOLDS` dict (`auto_accept`, `triage_review`, `flag_in_brief`); `ExtractedAtom` dataclass with confidence + source_span fields; `SourceGroundingVerifier` class.
- [ ] `SourceGroundingVerifier` uses sentence-transformers (`all-MiniLM-L6-v2`) to embed atom content + source windows and find the best-match window via cosine similarity.
- [ ] `SourceGroundingVerifier.verify(atom_content, source_text, window_size=200)` returns `(is_supported: bool, span_start: int|None, span_end: int|None)`.
- [ ] Default similarity threshold is 0.7 (Open Question 27 default); configurable via constructor.
- [ ] Atom extraction stages (#010, #011 amendments) call the verifier after the LLM returns candidate atoms; the verifier output populates `source_span_start`, `source_span_end`, and (implicitly) the auto-attach decision.
- [ ] Atoms with `extraction_confidence < 0.6` always create a triage item with `item_type='low_confidence_atom'`.
- [ ] Atoms with `is_supported=False` (no matching source span) are persisted but flagged: a triage item is created and the brief render service (#035 amendment) annotates them as "verify before acting" if confidence is also < 0.4.
- [ ] Rules-tier extraction (#012) is wired so the verifier is skipped (rules-tier atoms always have `is_supported=True` because the parse itself is the grounding).
- [ ] Unit tests cover: confidence thresholds route to right destinations; verifier returns supported=True for content that appears verbatim; verifier returns supported=False for fabricated content; rules-tier exemption works.
- [ ] All four CI gates pass.

## Notes

Reference: `loom-meta/docs/loom-v08-alignment.md` §3.3.

sentence-transformers is already in the dependency tree (it's used for stakeholder fuzzy resolution in #041). No new dependency.

Window size of 200 chars + 100-char stride is a reasonable default for transcript/email prose. Tunable in config if a content type needs different granularity.

The "triage item per low-confidence atom" rule means the Friday triage queue absorbs the calibration cost. If extraction is over-confident (too many atoms auto-attach incorrectly), the queue gets dirty fast — that signals a need to retune the threshold or the prompt. If extraction is under-confident, the queue gets long but never wrong — a slower-but-correct failure mode.

After this lands, atom extraction (#010, #011) gains the structural anti-hallucination defences. The training-signal loop (Phase D quarterly audit, #091) reads the dismissal/retraction patterns to flag prompts that are over- or under-confident.
