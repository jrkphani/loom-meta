# 012 — Atom extractor: Python rules tier

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #009
**User stories:** US-1, US-3

## Behaviour

Structured or semi-structured sources (CSV exports, Git commit messages, typed quick notes with explicit `type:` frontmatter) are parsed by a deterministic Python rules extractor rather than sent to an LLM. For example, a quick note with `type: decision` in frontmatter is parsed directly as a decision atom; a CSV of open actions is parsed as commitment atoms. This tier is cheap, fast, and deterministic — no LLM cost for well-structured input.

## Acceptance criteria

- [ ] A `.md` file with frontmatter `type: decision` in `inbox/work/notes/` is parsed as a decision atom with `confidence_sort_key = 1.0` (structurally certain).
- [ ] A `.md` file with frontmatter `type: commitment` and `owner:` field is parsed as a commitment atom; `atom_commitment_details.owner_stakeholder_id` is set if the owner email resolves to a known stakeholder (left NULL otherwise).
- [ ] An unknown or malformed structured file falls through to the Claude tier (sniffer calls Claude extractor as fallback).
- [ ] Unit tests use fixture files in `tests/fixtures/` with various frontmatter types; no LLM calls.
- [ ] Confidence sort key for rules-extracted atoms is `1.0` (deterministic = fully confident).

## Notes

The rules extractor checks: (1) YAML frontmatter `type` field, (2) file extension patterns, (3) directory-based conventions. It is intentionally conservative — if in doubt, it returns `None` and lets the Claude tier handle it.

Lives in `loom-core/src/loom_core/pipelines/extractor_rules.py`.

For v1 work domain, the most common structured input is a quick note typed in Obsidian Mobile with frontmatter. The Git commit and CSV extraction are implemented but may not be used in v1's daily workflow; they are included for completeness.

## Implementation Notes (locked during execution)

Three design calls locked during the TDD session that the original spec didn't anticipate:

### Session signature

`process_file(session: AsyncSession, path: Path, vault_path: Path) -> list[Atom]`. Mirrors `sniffer.process_file`. Session is read-only at extraction — used by commitment-rule for stakeholder email lookup; ignored by decision and status-update rules. Uniform signature across all rules; the unused-parameter smell on non-resolution rules is the deliberate trade per the project's anti-defensive-programming convention. Module docstring on `extractor_rules.py` documents the rationale.

Caller owns persistence: extractor does not call `session.add` / `session.add_all` / `session.commit`. Atoms returned are unbound; the caller's `session.add_all(atoms)` cascades aux records via the relationship.

### Aux detail records via SQLAlchemy `relationship()`

`Atom` carries a bidirectional `relationship()` to `AtomCommitmentDetails`:

- On `Atom`: `commitment_details: Mapped["AtomCommitmentDetails | None"] = relationship(back_populates="atom", uselist=False, cascade="all, delete-orphan")`
- On `AtomCommitmentDetails`: `atom: Mapped["Atom"] = relationship(back_populates="commitment_details")`

Model-shape edit only; no migration (FK column already existed per #076). Extractor sets `atom.commitment_details = AtomCommitmentDetails(...)` before returning. Caller's `session.add_all(atoms)` cascades the aux row. Return contract stays `list[Atom]`.

### Cross-reference resolution at extraction (vs deferred)

For fields the extractor has data for AND can resolve at extraction time via a single deterministic DB lookup (e.g., `owner_email → owner_stakeholder_id` via `Stakeholder.primary_email` exact match), the extractor performs the resolution and persists the result. Unresolved cross-references write `NULL`; the source file retains the raw value via `source_span_start` / `source_span_end`. The frontmatter email itself is NOT persisted on the atom row.

This is distinct from visibility scope, where the extractor always writes the literal default `'private'` and a separate user action (attach, #017) handles promotion to `engagement_scoped`. Different patterns: stakeholder resolution is a deterministic DB read with no human in the loop; visibility promotion is a user-driven state transition. Fuzzy / multi-candidate / cross-domain resolution is out of scope (#042 / #043 territory). Rules-tier does exact-match-on-email or NULL.

---

## v0.8 Alignment Addendum

**Depends on:** #076 (schema), #080 (cognition router), #083 (forward provenance)

The rules tier is the only extractor where `extraction_confidence = 1.0` is correct (deterministic parse). It still routes through `CognitionRouter.call_stage(stage='atom_extraction_structured', ...)` so the cost meter, privacy gate, and provenance hooks apply uniformly even for the free local tier.

### Additional acceptance criteria

- [ ] Calls route through `CognitionRouter` with `Provider.PYTHON_RULES` adapter; no direct parse-and-persist.
- [ ] Atom rows populate `extractor_provider = 'python_rules'`, `extractor_skill_version` (e.g., `frontmatter-parser-v1`), `extraction_confidence = 1.0`, `source_span_start`/`source_span_end` (the byte offsets of the parsed block in the source file), `visibility_scope`, `projection_at_creation`.
- [ ] Source-grounding verification (#082) is skipped for rules-tier atoms (deterministic parse already implies grounding); this is a documented exception in the verifier wrapper.
- [ ] Forward provenance hooks are called per #083 when the rules-extracted atom feeds any consumer.

## Closure note

Landed via Claude Code, 2026-05-05.

- 8 behaviours executed (B1–B8). All GREEN.
- Test count: 209 → 217 (+8). Full suite GREEN.
- All gates green: `ruff check`, `ruff format --check`, `mypy --strict src/`, `mypy --strict tests/`, `pytest`, `alembic check`.
- Atom kinds covered: decision (frontmatter, extension, directory tiers), commitment (frontmatter only — extension and directory tiers not in spec scope), status_update (frontmatter only). Three tiers, three kinds, tier precedence locked by B7. Unknown-frontmatter-type fall-through locked by B8.
- One design ambiguity surfaced and resolved mid-session: `AtomCommitmentDetails` has no `owner_email` column; resolution must happen at extraction via `Stakeholder.primary_email` lookup. Resolved by adding the session parameter to `process_file` (DESIGN CALL #9), the bidirectional relationship for aux records (#10), and the extraction-time resolution pattern (#11). All three documented in Implementation Notes above.

### Incidental landings

- **Bidirectional `Atom` ↔ `AtomCommitmentDetails` relationship in `models.py`.** No migration; the FK column already existed per #076. The relationship is reusable shape for any future kind-specific aux table (e.g., when #010 LLM tier emits commitment atoms, it gets cascade behaviour for free).
- **Minimal-Stakeholder fixture shape established in `tests/pipelines/test_extractor_rules.py`.** Three fields inline: `Stakeholder(id, canonical_name, primary_email)`. All other Stakeholder columns are nullable or have server-defaults per v0.8 schema. #013 (atom lifecycle) and #016 (atom search/provenance) can mirror this verbatim when they need a stakeholder for ownership or attribution tests. No reusable helper extracted — YAGNI at one call site; documented precedent only.

### Phase status

Phase A closed previously at #079. This issue is the first W3 atom extraction landing. Sequence continues with #010 (LLM-tier extractor — inherits session signature, aux-record pattern, and resolution-vs-deferral pattern from this issue) and #013 (atom lifecycle status) on independent tracks.

