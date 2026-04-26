# 073 — Log rotation: structlog JSON config and rotation verification

**Workstream:** W13
**Tag:** AFK
**Blocked by:** none
**User stories:** US-34

## Behaviour

Loom Core writes structured JSON logs via `structlog` to a rotating log file. Log rotation is configured to keep 5 files × 100MB max (per PRD §6.1). The log file path is `~/Library/Logs/Loom/loom-core.log`. The `loom doctor` output shows the log file size and rotation status. This issue configures logging at startup and verifies it in a test.

## Acceptance criteria

- [ ] `structlog` is configured at app startup to write JSON-formatted log lines to `~/Library/Logs/Loom/loom-core.log`.
- [ ] `logging.handlers.RotatingFileHandler` is used with `maxBytes=100_000_000` (100MB) and `backupCount=5`.
- [ ] Log lines include: timestamp, level, logger name, message, and any bound context variables.
- [ ] The FastAPI app startup (lifespan) logs "Loom Core started" at INFO level.
- [ ] `loom doctor` shows: log file path, current size in MB, number of rotated files present.
- [ ] A unit test verifies: (1) log configuration is set up without errors, (2) a sample log message appears in the output.

## Notes

`structlog>=24.4` is already a dependency. Use `structlog.configure()` at the module level in `loom_core/__init__.py` or `main.py` (called once at startup).

The log file directory `~/Library/Logs/Loom/` must be created at startup if it does not exist.

For the launchd plist (already done in W1): ensure `StandardOutPath` and `StandardErrorPath` in the plist point to the log file or `/dev/null` (if structlog handles all logging).

JSON log format: `{"timestamp": "...", "level": "info", "logger": "...", "message": "..."}`.
