# 053 — MCP: name → ULID resolution layer

**Workstream:** W10
**Tag:** AFK
**Blocked by:** #001
**User stories:** US-24

## Behaviour

Claude's tool calls use natural-language names ("Panasonic Wave 2", "Madhavan") rather than ULIDs. The resolution layer in loom-mcp maps these names to the correct ULIDs before calling Loom Core. It uses a two-step approach: (1) exact case-insensitive match against engagement names and stakeholder canonical names, (2) fuzzy match if exact fails. Results are cached per session (no DB per tool call).

## Acceptance criteria

- [ ] `resolve_engagement(domain, name) -> str` calls `GET /v1/engagements?domain=work` (once per session, cached), then matches the name case-insensitively.
- [ ] `resolve_arena(domain, name) -> str` does the same for arenas.
- [ ] `resolve_stakeholder(name) -> str` matches against stakeholder canonical names and aliases.
- [ ] Fuzzy matching (rapidfuzz token_sort_ratio ≥ 0.8) is used when exact match fails.
- [ ] When no match is found, the tool raises a `ValueError` with a helpful message listing known names.
- [ ] The resolution cache is per-session (FastMCP lifespan scope), not persistent across sessions.
- [ ] Unit tests: exact match, fuzzy match, no match (ValueError), cache hit (no extra HTTP call).

## Notes

Lives in `loom-mcp/src/loom_mcp/resolution.py`.

The session cache stores the list of engagements/arenas/stakeholders fetched from the API at first call. It does not auto-refresh during a session — if a new engagement is created mid-session, the user needs to start a new session or the tool accepts the raw ULID as a fallback.

`rapidfuzz` is already a dependency of `loom-core`; add it to `loom-mcp/pyproject.toml` as well.
