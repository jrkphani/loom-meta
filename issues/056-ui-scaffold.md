# 056 — loom-ui: repo scaffold and LoomClient actor

**Workstream:** W11
**Tag:** HITL
**Blocked by:** none
**User stories:** US-38

## Behaviour

The `loom-ui` Swift package is initialised as an Xcode project targeting macOS 26. The `LoomClient` actor encapsulates all HTTP communication with Loom Core and is the single dependency injection point for all view models. This issue creates the structural skeleton: Package.swift, Xcode scheme, LoomClient actor, and a health-check call that confirms the UI can talk to the daemon.

## Acceptance criteria

- [ ] `loom-ui/Package.swift` defines a SwiftUI macOS 26 target.
- [ ] `LoomClient` is a Swift actor with a configurable `baseURL` (default `http://127.0.0.1:9100`) and a generic `request<T: Decodable>` method.
- [ ] `LoomClient.health()` calls `GET /v1/health` and returns `HealthResponse`; the result is logged at startup.
- [ ] `xcodebuild -scheme LoomUI build` succeeds with zero errors.
- [ ] `swift test` passes with at least one unit test (health response decoding).
- [ ] Human verification: run the app, confirm it connects to Loom Core and logs "Loom Core connected."

## Notes

HITL because this is the first build of the SwiftUI project, which requires Xcode 26 (macOS 26 target) to be installed and configured. The build environment is not automatable.

`loom-ui` is a separate repo under `/Users/jrkphani/Projects/loom/loom-ui/`. It is not a sub-package of loom-core or loom-mcp.

Use `@Observable` view models (macOS 26 / Swift 5.10 / SwiftUI). URLSession for networking. No third-party Swift dependencies unless strictly necessary.

The `LoomClient` actor is injected via SwiftUI's `@Environment` key throughout the view hierarchy.
