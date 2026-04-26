# 064 — Apple AI sidecar: repo scaffold and health endpoint

**Workstream:** W12
**Tag:** HITL
**Blocked by:** none
**User stories:** US-36

## Behaviour

The `loom-apple-ai` Swift package is initialised as a Vapor 4 HTTP server targeting macOS 26 with Apple Intelligence enabled. The health endpoint confirms the server is running. A launchd plist registers it as a daemon that auto-restarts. This issue creates the structural skeleton — no LLM calls yet.

## Acceptance criteria

- [ ] `loom-apple-ai/Package.swift` declares a Swift executable target with Vapor 4 as a dependency.
- [ ] `GET /v1/health` returns `{"status": "ok", "version": "1.0.0"}`.
- [ ] `swift build` succeeds with zero errors on a machine with Xcode 26 and Apple Intelligence enabled.
- [ ] `swift test` passes with at least one unit test (health response shape).
- [ ] A launchd plist at `~/Library/LaunchAgents/com.loom.apple-ai.plist` registers the daemon with auto-restart.
- [ ] Human verification: `launchctl load ~/Library/LaunchAgents/com.loom.apple-ai.plist` starts the daemon; `curl http://127.0.0.1:9101/v1/health` returns `{"status": "ok"}`.

## Notes

HITL because this requires Xcode 26 + macOS 26 with Apple Intelligence enabled. The first `FoundationModels` build is environment-specific and cannot be automated in CI.

Default port: 9101 (per system design §12: "Apple AI sidecar http_port = 9101").

The `loom-apple-ai` repo is separate from `loom-core`. Launchd plist uses `WorkingDirectory` pointing to the binary built by `swift build`.

structlog equivalent for Swift: use `swift-log` with a JSON formatter (per PRD §6.1).
