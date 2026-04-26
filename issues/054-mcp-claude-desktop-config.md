# 054 — MCP: Claude Desktop config and spawn verification

**Workstream:** W10
**Tag:** HITL
**Blocked by:** #053
**User stories:** US-24

## Behaviour

The `loom-mcp` server is configured in Claude Desktop's MCP config file so that Claude Desktop spawns it automatically per session via stdio. Phani verifies the wiring by asking Claude "list my engagements" and confirming the tool call succeeds with real data. This is a one-time, environment-specific setup that cannot be automated end-to-end.

## Acceptance criteria

- [ ] `~/.config/claude/config.json` (or equivalent) has an `mcpServers.loom` entry pointing to the `loom-mcp` entry point with the correct Python path.
- [ ] `uv run loom-mcp` (or the entry point defined in `pyproject.toml`) starts the FastMCP server and responds to a `tools/list` call.
- [ ] Claude Desktop spawns `loom-mcp` per session and `list_engagements` returns the current engagement list from the live Loom Core daemon.
- [ ] The `LOOM_CORE_URL` environment variable (or config) is set correctly so `loom-mcp` can reach Loom Core at `http://127.0.0.1:9100`.
- [ ] Human verification: Phani types "show me my engagements" in Claude Desktop and sees the list.

## Notes

HITL because Claude Desktop's MCP config installation is user-environment-specific and cannot be automated safely.

The `pyproject.toml` entry point: `[project.scripts] loom-mcp = "loom_mcp.server:main"`.

The FastMCP server runs in stdio mode when spawned by Claude Desktop. It should also support `--transport http` for local debugging.

Loom Core must be running as a launchd daemon when Claude Desktop spawns loom-mcp. The launchd plist for loom-core is already done (W1).
