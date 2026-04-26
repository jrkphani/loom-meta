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
