# 051 — MCP tools: open commitments, decisions, asks, risks, pending reviews

**Workstream:** W10
**Tag:** AFK
**Blocked by:** #001, #020
**User stories:** US-24

## Behaviour

Five read-only MCP tools give Phani immediate access to work-in-progress tracking via Claude Desktop: open commitments, recent decisions, open asks, the risk register, and pending triage reviews. Each tool accepts `domain` and optionally `engagement_name` or `arena_name` to scope the query. Results are formatted as concise markdown for Claude's context window.

## Acceptance criteria

- [ ] `get_open_commitments(domain, engagement_name?)` calls `GET /v1/atoms?type=commitment&dismissed=false` (scoped by engagement if provided), returns a formatted list of open items with owner, due date, status.
- [ ] `get_recent_decisions(domain, engagement_name?, since_days=14)` returns decision atoms created in the last N days.
- [ ] `get_open_asks(domain, engagement_name?)` returns ask atoms with `current_status NOT IN ('granted', 'declined')`.
- [ ] `get_risk_register(domain, engagement_name?)` returns risk atoms with `mitigation_status NOT IN ('mitigated', 'accepted')`, sorted by severity (critical first).
- [ ] `get_pending_reviews(domain)` calls `GET /v1/triage` and returns the count and top 5 items awaiting review.
- [ ] Each tool is tested with a mocked Loom Core HTTP client (fixture responses).
- [ ] All 5 tools are reachable from the FastMCP server started in #001.

## Notes

Tool files: `loom-mcp/src/loom_mcp/tools/atoms.py`.

The `engagement_name` → `engagement_id` resolution uses the name→ULID layer (#054). If #054 is not yet done, implement a direct `GET /v1/engagements?name_contains=` lookup.

Output format: Markdown table or numbered list, depending on the number of items. For risk register, bold the severity column. For asks, include the owner name if available.

These tools do not write anything. They are safe to call frequently.
