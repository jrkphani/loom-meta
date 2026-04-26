# 067 — Apple AI: Loom Core HTTP client with fallback semantics

**Workstream:** W12
**Tag:** AFK
**Blocked by:** #065
**User stories:** US-36

## Behaviour

`loom_core/llm/apple_ai.py` is the Python HTTP client that Loom Core uses to call the Apple AI sidecar. It implements the same interface as the Claude client so the caller can switch between the two. When the sidecar is unavailable (timeout, 500, connection refused), the client falls back to Claude automatically. Fallback is logged at WARNING level with the failure reason. The `fallback_to_claude_on_error` config flag controls this behaviour.

## Acceptance criteria

- [ ] `AppleAIClient` class with methods: `summarize(text, max_sentences?) -> str`, `extract_tags(text) -> list[str]`, `classify_domain(text) -> tuple[str, float]`, `clean_note(text) -> str`, `disambiguate(mention, context, candidates) -> tuple[str | None, str]`.
- [ ] Each method uses `httpx.AsyncClient` to call the sidecar.
- [ ] When the sidecar returns 5xx or raises `httpx.ConnectError` / `httpx.TimeoutException`, falls back to the Claude client for the equivalent call.
- [ ] Fallback is governed by `settings.apple_ai.fallback_to_claude_on_error` (default true).
- [ ] When `settings.apple_ai.enabled = false`, all calls route directly to Claude without attempting the sidecar.
- [ ] Service tests with mocked httpx: sidecar success path, sidecar 503 → fallback path, fallback logged.

## Notes

The client is injected as a dependency (not constructed inside the callers). Use FastAPI's dependency injection for lifespan-scoped instances.

`loom_core/llm/claude.py` must expose the same method signatures as `AppleAIClient` so callers can use either interchangeably (duck-typed protocol or ABC).

Timeout for sidecar calls: 3 seconds (the sidecar is on-device, so 3s is generous). Claude timeout is configured separately (system design §13: `timeout_seconds = 60`).
