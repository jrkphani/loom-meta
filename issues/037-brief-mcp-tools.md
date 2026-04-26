# 037 — Brief MCP tools: get_engagement_brief and get_arena_brief

**Workstream:** W7
**Tag:** AFK
**Blocked by:** #035, #036
**User stories:** US-20, US-24

## Behaviour

Phani asks Claude "get me the Panasonic brief" and Claude calls `get_engagement_brief("work", "Panasonic Wave 2")`. The tool resolves the name to a ULID, fetches the latest pre-generated brief from the vault (falling back to on-demand generation if no brief exists for today), and returns the markdown content. The response is in < 5 seconds (US-20). `get_arena_brief` does the same for account-level briefs.

## Acceptance criteria

- [ ] `get_engagement_brief(domain, engagement_name)` resolves the name to an engagement ULID via the name→ULID resolution layer (#054), fetches the brief path from `GET /v1/briefs/engagements/:id/latest`, reads the markdown file, and returns its content.
- [ ] If no brief exists for today, the tool calls `POST /v1/briefs/engagements/:id/generate` and returns the freshly generated content.
- [ ] `get_arena_brief(domain, arena_name)` does the same for arenas.
- [ ] Both tools return within 5 seconds for a pre-generated brief (file read from disk; no LLM call needed).
- [ ] Tool tests use a mocked Loom Core HTTP client with a fixture brief file.

## Notes

The name→ULID resolution layer (#054 in W10) is a dependency. If #054 is not yet done, implement a simple `GET /v1/engagements?name_contains=Panasonic` lookup as a placeholder.

Tool files: `loom-mcp/src/loom_mcp/tools/briefs.py`.

The 5-second constraint (US-20) is met by returning the pre-generated file. On-demand generation can take longer (Claude API call); if it exceeds 10 seconds, return a `Brief generation in progress` message and let the cron deliver the next brief.
