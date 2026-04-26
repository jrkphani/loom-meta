# 001 — T1: engagements tracer bullet

**Workstream:** W2
**Tag:** AFK
**Blocked by:** none
**User stories:** US-8, US-9

## Behaviour

Phani can create an arena (account), create an engagement under it, and list engagements for a domain through the Loom Core HTTP API. Claude Desktop can also list engagements via the `list_engagements` MCP tool. This is the first thin slice through every layer: service → route → MCP → integration test. The W1 schema migration is already applied; this issue builds the Python service + FastAPI routes + FastMCP tool on top of it.

## Acceptance criteria

- [ ] `POST /v1/arenas` creates an arena row with domain, name, optional description; returns 201 with the new resource.
- [ ] `POST /v1/engagements` creates an engagement linked to a valid arena; returns 201 with the new resource.
- [ ] `GET /v1/engagements?domain=work` returns a list of engagements (possibly empty); supports filtering by `arena_id` and `ended_at IS NULL`.
- [ ] MCP tool `list_engagements` calls `GET /v1/engagements` and returns a formatted list; tested with a mocked Loom Core HTTP client.
- [ ] An integration test creates an arena + engagement via API, then calls `list_engagements` through the MCP layer and asserts the engagement appears.
- [ ] All four CI gates pass: `uv run ruff check`, `uv run ruff format --check`, `uv run mypy --strict`, `uv run pytest`.

## Notes

Schema: `arenas` (lines ~45–53) and `engagements` (lines ~57–68) in `loom-schema-v1.sql`. Both tables are in the W1 migration.

Routes live in `loom-core/src/loom_core/api/arenas.py` and `…/api/engagements.py`. Services in `…/services/arenas.py` and `…/services/engagements.py`.

The MCP server scaffold (pyproject.toml, uv env) is already done. The FastMCP server entry point (`loom-mcp/src/loom_mcp/server.py`) and the `list_engagements` tool file (`…/tools/engagements.py`) are new. Follow the FastMCP tool pattern: `@mcp.tool()` decorator + `httpx.AsyncClient` injected via FastMCP lifespan.

The integration test lives in `loom-core/tests/integration/` and also tests the MCP layer by importing the tool handler directly with a mock HTTP client. Real SQLite temp file, no mocks on the loom-core side.

ULIDs generated with `python_ulid.ULID()`. Domain is always `"work"` in v1.
