# 010 — Atom extractor: Claude prose tier

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #009
**User stories:** US-1, US-2, US-3, US-25

## Behaviour

Given a newly created event with `source_path` pointing to a transcript or note, the Claude-tier extractor reads the source text, calls the Claude API, and extracts typed atoms (decisions, commitments, asks, risks, status_updates). Each atom gets a ULID, an `anchor_id` (e.g., `d-001`, `c-002`), a `confidence_sort_key`, and is stored in `atoms`. For commitment/ask/risk atoms, the corresponding detail row is also written. The extractor runs as part of the `inbox_sweep` pipeline after the sniffer creates the event.

## Acceptance criteria

- [ ] Given a transcript event, the extractor produces ≥1 atom of at least two different types (or zero atoms if the source has no extractable facts — not an error).
- [ ] Each atom has a unique `anchor_id` within its parent event (`idx_atoms_anchor_event` constraint is respected).
- [ ] Commitment atoms have a corresponding `atom_commitment_details` row with `current_status = 'open'`.
- [ ] Ask atoms have a corresponding `atom_ask_details` row with `current_status = 'raised'`.
- [ ] Risk atoms have a corresponding `atom_risk_details` row with `severity` populated.
- [ ] Claude API failures are caught, logged, and the pipeline continues; the event is marked as not-yet-extracted (via a `processor_runs` failure count, not a separate status column on events).
- [ ] Unit tests use a mocked Claude SDK client (not real API calls); a snapshot test asserts atom types and anchor IDs from a fixture transcript.
- [ ] All four CI gates pass with the mocked Claude client.

## Notes

The Claude client lives in `loom-core/src/loom_core/llm/claude.py`. Use `anthropic.AsyncAnthropic` with the `ANTHROPIC_API_KEY` env var. Mock at the SDK boundary in tests (inject the client).

Extraction prompt: a system prompt describing atom types + an instruction to output structured JSON. The Claude response is parsed into `atoms` rows. The exact prompt is implementation detail — the acceptance criteria test the output, not the prompt.

Schema: `atoms` (lines ~183–209), `atom_commitment_details` (lines ~221–230), `atom_ask_details` (lines ~234–244), `atom_risk_details` (lines ~247–255) in `loom-schema-v1.sql`. All tables are in the W1 migration.

Anchor IDs: `d-NNN` for decisions, `c-NNN` for commitments, `a-NNN` for asks, `r-NNN` for risks, `s-NNN` for status_updates. Counter resets per event.

Lives in `loom-core/src/loom_core/pipelines/extractor_claude.py`.
