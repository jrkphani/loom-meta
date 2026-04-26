# 055 — MCP: end-to-end smoke test across all tools

**Workstream:** W10
**Tag:** AFK
**Blocked by:** #051, #052, #053
**User stories:** US-24

## Behaviour

A single integration test spins up a real Loom Core instance in a temp directory, seeds it with fixture data (one arena, one engagement, two hypotheses, five atoms), then calls every MCP tool through the actual tool handler with a real HTTP client pointed at the running Loom Core. This is the smoke test that proves the full MCP stack works end-to-end, not just unit-tested in isolation.

## Acceptance criteria

- [ ] The test spawns Loom Core with an in-process `asyncio` test runner (no subprocess), connected to a temp SQLite DB with the W1 + section-2 + section-3 + section-4 migrations applied.
- [ ] Fixture data seeded: 1 arena, 1 engagement, 2 hypotheses, 5 atoms (mix of types).
- [ ] `list_engagements` returns the 1 engagement.
- [ ] `get_open_commitments` returns the commitment atoms.
- [ ] `get_atom_provenance` returns a valid provenance chain for one atom.
- [ ] `get_engagement_brief` returns a brief path (brief generated on-demand if not pre-generated).
- [ ] `write_to_notebook` creates an artifact and returns an artifact_id.
- [ ] `get_notebook` retrieves the artifact content written in the previous step.
- [ ] The test passes with zero errors and is marked `@pytest.mark.integration`.

## Notes

Test file: `loom-mcp/tests/integration/test_smoke.py`.

Use `httpx.AsyncClient` pointed at the in-process FastAPI app (same pattern as existing `loom-core` integration tests). The MCP tool handlers are called directly (not via stdio protocol) — import the handler functions and call them with a real HTTP client.

This test is the canonical "does the whole thing work?" gate. It should run in CI (no external services needed — Apple AI and Claude are mocked).
