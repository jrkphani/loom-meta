# 015 — outlook-mcp integration: Teams transcript pull and email retention

**Workstream:** W3
**Tag:** HITL
**Blocked by:** #010
**User stories:** US-1, US-4

## Behaviour

Loom Core calls the user's existing `outlook-mcp` server to pull Teams meeting transcripts and email metadata. Transcripts are written to `inbox/work/transcripts/` where `inbox_sweep` picks them up. Email message IDs are captured as external references rather than duplicating the email body. This integration requires the user's `outlook-mcp` authentication to be working — it cannot be fully automated without real credentials.

## Acceptance criteria

- [ ] `loom-core/src/loom_core/integrations/outlook_mcp.py` implements an async client that calls `outlook-mcp` via subprocess or HTTP (matching the user's existing `outlook-mcp` config).
- [ ] `pull_recent_transcripts(since: datetime)` returns a list of transcript file paths written to `inbox/work/transcripts/`.
- [ ] `get_email_message_id(subject: str, sender: str)` returns the Outlook message ID string.
- [ ] A config option `[core] outlook_mcp_enabled = true` gates this integration; when false, the client returns empty results silently.
- [ ] An opt-in integration test (marked `@pytest.mark.external`) calls the real `outlook-mcp` and verifies at least one transcript is pulled.
- [ ] Human verification: run `loom-core/scripts/test_outlook_mcp.py` against the real `outlook-mcp` and confirm a transcript is written to `inbox/work/transcripts/`.

## Notes

HITL because the `outlook-mcp` server uses the user's Microsoft 365 credentials. The auth flow is already configured in the user's `outlook-mcp` — Loom Core should reuse it, not re-implement it.

The `outlook-mcp` server may run as a stdio MCP server or as an HTTP server. Check the user's existing config to determine the call pattern. This detail must be verified by the user before implementation.

The `external_ref_verify` pattern (weekly cron) does NOT apply to email message IDs — emails are permanent in Outlook and don't need reachability checks.
