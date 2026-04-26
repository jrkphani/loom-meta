# 063 — loom-ui: settings view

**Workstream:** W11
**Tag:** AFK
**Blocked by:** #057
**User stories:** US-38

## Behaviour

The Settings section provides read-only visibility into the system's configuration and daemon health, plus a few user-adjustable preferences. Phani can see the Loom Core health status, last cron run times, and the configured db_path and vault_path. In v1, settings are mostly observational — the config TOML is the source of truth.

## Acceptance criteria

- [ ] `SettingsView` shows a daemon health section: Loom Core status (from `GET /v1/health`), last inbox_sweep run time, last state_inference run time, last brief_engagement run time.
- [ ] Shows db_path and vault_path (from `/v1/health` response or a dedicated `/v1/config` endpoint).
- [ ] Shows pending triage count and pending migration review count (from `GET /v1/triage/staleness` and `GET /v1/migration/status`).
- [ ] A "Refresh" button re-fetches all health data.
- [ ] ViewModel unit test with mocked health response.

## Notes

The Settings view intentionally does NOT allow editing config values in v1 (config is TOML-only). It is a dashboard, not a configuration editor.

If `/v1/health` does not yet return `vault_path` or `db_path`, those can be omitted from Settings and added later. The core requirement is daemon health visibility.

This view is simple — keep it as a `Form` with `Section` groups.
