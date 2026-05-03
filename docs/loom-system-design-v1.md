# Loom v1 — System design document

**Version**: 1.0.0
**Date**: April 26, 2026
**Status**: Build-ready
**Scope**: v1 ships Work domain only on macOS 26 (Tahoe), Apple Silicon

---

## 0. How to read this document

This is the authoritative reference for building Loom v1. It pins every dependency to a specific version and describes how each piece fits together. It is intended to be self-contained for a developer building from scratch, with explicit references to the four companion artifacts in the project:

- `loom-design.md` — concept and principles (the "why")
- `loom-blueprint.md` — universal core (the cross-projection invariants)
- `loom-schema-v1.sql` — SQLite DDL (the data shape)
- `loom-api-v1.md` — HTTP API spec (the interface)

Where this document conflicts with the companion artifacts, this document wins; it represents the latest synthesis.

---

## 1. Executive summary

Loom is a personal knowledge fabric — a system that captures the daily evidence of work (Teams transcripts, dictation, email, quick notes), extracts atoms (decisions, commitments, asks, risks, status updates), attaches those atoms to value-anchored hypotheses, infers state changes, and renders briefs. The v1 ships the Work domain (CRO at 1CloudHub) only.

Architecturally, Loom is a Mac-resident standalone application:

- **Loom Core** — Python daemon. The hub. Sole writer to the structured store and the Obsidian vault. Exposes an HTTP API on localhost.
- **MCP server** — Python daemon. Thin wrapper around Loom Core's HTTP API, exposing it as MCP tools for Claude Desktop.
- **Apple AI sidecar** — Swift daemon. Wraps Apple's Foundation Models framework, exposed as a local HTTP service for tasks where on-device inference suffices.
- **Loom UI** — Native Mac SwiftUI app. The triage and projection-management surface.

All four communicate via HTTP localhost except Claude Desktop ↔ MCP server, which uses stdio per the MCP protocol. The structured store is SQLite, Mac-local. The vault is Obsidian, iCloud-synced. Existing Obsidian vaults are migrated via two-tier-confidence rewriting (Apple AI for pre-pass, Claude API for canonical rewrite).

Knowledge graph generation is first-class: every database write fans out to a markdown page in the vault with visible block anchors, wikilinks, and tags. Obsidian's graph view becomes a working surface, not decoration.

---

## 2. System architecture

### 2.1 Layered view

Six logical layers:

1. **Capture sources** — iPhone dictation (Superwhisper), typed notes, email forwards, web clippings, Claude conversation exports, outlook-mcp (Teams + email), git polling, statement imports, existing Obsidian vaults (migration source).
2. **iCloud-synced Loom vault** — `inbox/{domain}/`, `notebooks/{domain}/`, `outbox/{domain}/`. Carries the knowledge graph (wikilinks, tags, backlinks).
3. **Loom Core** — standalone Mac app. Houses the migration pipeline, processor pipeline (sniff → extract → infer → render), knowledge graph generator, and internal HTTP API.
4. **Structured store** — SQLite, Mac-local, never on iCloud. Universal core tables plus work-projection tables.
5. **Interface** — single MCP server instance wrapping Loom Core's API for Claude.
6. **Surfaces** — Claude (primary, via MCP), Loom UI (SwiftUI, triage and projection lifecycle), Obsidian Mac/iOS (read fallback via iCloud).

### 2.2 Process topology

| Process | Language | Lifecycle | Listens on |
|---|---|---|---|
| Loom Core daemon | Python 3.13.13 | launchd, always-on | `127.0.0.1:9100` |
| MCP server | Python 3.13.13 | launchd or spawned by Claude Desktop | stdio (Claude Desktop) |
| Apple AI sidecar | Swift 6.x | launchd, always-on | `127.0.0.1:9101` |
| Loom UI | SwiftUI (Swift 6.x) | User-launched | — (HTTP client only) |
| Claude Desktop | (Anthropic) | User-launched | — |
| Obsidian | (user-installed) | User-launched or background | — (filesystem only) |

All localhost ports configurable via `~/Library/Application Support/Loom/config.toml` (full configuration schema in §8).

### 2.3 Inter-process communication

| From → To | Mechanism | Notes |
|---|---|---|
| Claude Desktop → MCP server | stdio (JSON-RPC over MCP) | Spawned per Claude Desktop session |
| MCP server → Loom Core | HTTP/1.1 over localhost | JSON, ULIDs, ISO 8601 |
| Loom UI → Loom Core | HTTP/1.1 over localhost | Same as MCP path |
| Loom Core → Apple AI sidecar | HTTP/1.1 over localhost | JSON; structured prompts |
| Loom Core → Claude API | HTTPS | Anthropic SDK |
| Loom Core → outlook-mcp | HTTP/stdio (already configured) | Reuses user's existing setup |
| Loom Core → SQLite | File I/O via SQLAlchemy | WAL mode; single writer |
| Loom Core → Loom vault | File I/O via Python `pathlib` | Markdown writes; Obsidian reads via iCloud sync |
| Obsidian → Loom vault | File I/O via iCloud Drive | Read-only from Loom's perspective; user writes are confined to `notebooks/` |

---

## 3. Tech stack with pinned versions

### 3.1 Operating system

- **macOS 26.x (Tahoe)** — required for Apple Foundation Models framework. Apple Silicon only (M1, M2, M3, M4 series). Apple Intelligence must be enabled in System Settings.
- **iCloud Drive** — required for vault sync to iOS Obsidian.
- **launchd** — macOS native service manager; used to manage the three daemons.

### 3.2 Loom Core (Python daemon)

| Component | Version | Notes |
|---|---|---|
| Python | **3.13.13** | Long-term support branch, latest patch (April 7, 2026). 3.14 is the newest feature release but 3.13 has broader ecosystem maturity. |
| `uv` | **0.5.x** (latest patch) | Package and venv manager; replaces pip + venv. |
| `fastapi` | **0.115.x** | HTTP framework. |
| `uvicorn[standard]` | **0.32.x** | ASGI server. Use `--workers 1` (Loom Core is single-writer; one worker keeps SQLite locking sane). |
| `pydantic` | **2.9.x** | Request and response validation. |
| `sqlalchemy` | **2.0.x** | ORM. Async mode. |
| `aiosqlite` | **0.20.x** | Async SQLite driver. |
| `alembic` | **1.13.x** | Schema migrations. |
| `python-ulid` | **2.7.x** | ULID generation for primary keys. |
| `python-frontmatter` | **1.1.x** | Parse and write Obsidian frontmatter. |
| `mistune` | **3.0.x** | Markdown parser for inbox sniffing and atom extraction. |
| `jinja2` | **3.1.x** | Markdown page templating (KG generator and brief renderer). |
| `httpx` | **0.27.x** | Async HTTP client (calls to Apple AI sidecar, outlook-mcp, web fetches). |
| `anthropic` | **0.97.x** | Claude API client. |
| `mcp` | **1.27.x** | Used by the sibling MCP server process; not by Loom Core itself. |
| `sentence-transformers` | **3.3.x** | Embeddings for stakeholder resolution and atom dedup. |
| `rapidfuzz` | **3.10.x** | Fuzzy string matching for entity resolution. |
| `apscheduler` | **3.10.x** | Cron scheduling inside Loom Core (alternative to launchd timers; used for in-process cadence). |
| `tomli` (stdlib in 3.13) | — | TOML config parsing; built-in. |
| `python-dotenv` | **1.0.x** | Optional, for development convenience. |
| `structlog` | **24.4.x** | Structured logging. |
| `pytest` | **8.3.x** | Test runner. |
| `pytest-asyncio` | **0.24.x** | Async test support. |
| `ruff` | **0.7.x** | Linter and formatter. |
| `mypy` | **1.13.x** | Type checker. |

#### Python `pyproject.toml` snippet

```toml
[project]
name = "loom-core"
version = "1.0.0"
requires-python = ">=3.13,<3.14"
dependencies = [
    "fastapi>=0.115,<0.116",
    "uvicorn[standard]>=0.32,<0.33",
    "pydantic>=2.9,<3.0",
    "sqlalchemy[asyncio]>=2.0,<2.1",
    "aiosqlite>=0.20,<0.21",
    "alembic>=1.13,<1.14",
    "python-ulid>=2.7,<3.0",
    "python-frontmatter>=1.1,<1.2",
    "mistune>=3.0,<4.0",
    "jinja2>=3.1,<4.0",
    "httpx>=0.27,<0.28",
    "anthropic>=0.97,<0.98",
    "sentence-transformers>=3.3,<4.0",
    "rapidfuzz>=3.10,<4.0",
    "apscheduler>=3.10,<4.0",
    "structlog>=24.4,<25.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3,<9.0",
    "pytest-asyncio>=0.24,<0.25",
    "ruff>=0.7,<0.8",
    "mypy>=1.13,<2.0",
]
```

### 3.3 MCP server (Python daemon)

| Component | Version | Notes |
|---|---|---|
| Python | **3.13.13** | Same as Loom Core. |
| `mcp` | **1.27.x** | Official MCP Python SDK. Use the FastMCP API for ergonomics. |
| `httpx` | **0.27.x** | HTTP client to Loom Core. |
| `pydantic` | **2.9.x** | Tool argument validation. |

The MCP server is small — roughly 300–500 lines. It declares one tool per MCP function (10 universal + handful of work-domain-specific), each tool resolves names to IDs (one HTTP call to Loom Core if needed) and proxies the request, returns the JSON response to Claude.

### 3.4 Apple AI sidecar (Swift daemon)

| Component | Version | Notes |
|---|---|---|
| Swift | **6.x** | Bundled with Xcode 26. |
| Xcode | **26.x** | For build. |
| `FoundationModels` | system | macOS 26 framework. |
| `Vapor` | **4.x** | Swift HTTP server (Apache 2.0). Mature, async-await native. |
| `swift-argument-parser` | **1.5.x** | CLI flags for the daemon. |
| `swift-log` | **1.6.x** | Logging façade; backed by `OSLog` on macOS. |

The sidecar exposes endpoints like `POST /summarize`, `POST /extract-tags`, `POST /classify-domain`, `POST /clean-note`. Each accepts a structured JSON request, dispatches to a `LanguageModelSession` with appropriate `@Generable` types, returns the structured output as JSON.

#### Swift `Package.swift` snippet

```swift
// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "LoomAppleAI",
    platforms: [.macOS(.v26)],
    products: [
        .executable(name: "loom-apple-ai", targets: ["LoomAppleAI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/vapor/vapor.git", from: "4.108.0"),
        .package(url: "https://github.com/apple/swift-argument-parser.git", from: "1.5.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.6.0"),
    ],
    targets: [
        .executableTarget(
            name: "LoomAppleAI",
            dependencies: [
                .product(name: "Vapor", package: "vapor"),
                .product(name: "ArgumentParser", package: "swift-argument-parser"),
                .product(name: "Logging", package: "swift-log"),
            ]
        ),
    ]
)
```

### 3.5 Loom UI (SwiftUI app)

| Component | Version | Notes |
|---|---|---|
| Swift | **6.x** | Same Xcode 26. |
| SwiftUI | system | macOS 26 native. |
| `Observation` | system | `@Observable` macro for view models. |
| `URLSession` | system | HTTP client to Loom Core. No third-party HTTP lib. |
| `swift-log` | **1.6.x** | Same logging façade as sidecar. |
| `swift-collections` | **1.1.x** | Useful data structures (`OrderedDictionary`, `Deque`). |

The app is a standard SwiftUI document-less app, single window with a sidebar (Engagements / Hypotheses / Triage / Migration / Settings) and a detail pane.

### 3.6 Storage and runtime

| Component | Version | Notes |
|---|---|---|
| SQLite | **3.43+** (bundled with macOS 26) | WAL mode, foreign keys enabled, partial indexes. |
| Obsidian | **1.7+** (user-installed) | The vault renderer; not a build dependency. |
| iCloud Drive | system | Vault sync substrate. |

### 3.7 External dependencies (already user-configured)

| Component | Version | Notes |
|---|---|---|
| `outlook-mcp` | user's existing | Pre-existing MCP for Teams + Outlook. Loom Core consumes its tools via subprocess or HTTP. |
| Claude Desktop | latest | The Claude consumer process. |
| Claude API | — | Cloud LLM via Anthropic SDK. |
| Apple Intelligence | enabled | System-level prerequisite for the sidecar. |

---

## 4. Component specifications

### 4.1 Loom Core daemon

**Process**: Single Python process, single uvicorn worker. Single-writer guarantee on the structured store.

**Listens on**: `127.0.0.1:9100`. Configurable.

**Responsibilities**:
- Expose the HTTP API documented in `loom-api-v1.md`.
- Run cron pipelines on schedule (via APScheduler in-process):
  - `inbox_sweep` — every 5 minutes
  - `state_inference` — daily at 6:30am
  - `kg_render` — on-write fan-out + a nightly full reconciliation at 2am
  - `brief_generation` — engagement briefs weekday 7am, arena briefs Sunday 6am
  - `migration_batch` — manually triggered
- Mediate calls to Apple AI sidecar (HTTP localhost) and Claude API (HTTPS) per the operations classification matrix.
- Generate and update Obsidian markdown pages on every entity write.

**Internal modules** (rough):

```
loom_core/
├── main.py                  # FastAPI app, uvicorn entry, launchd shim
├── api/                     # HTTP route handlers; thin layer over services
│   ├── hypotheses.py
│   ├── atoms.py
│   ├── briefs.py
│   ├── triage.py
│   └── ...
├── services/                # Business logic
│   ├── triage_service.py
│   ├── brief_service.py
│   ├── migration_service.py
│   └── ...
├── pipelines/               # Cron-driven processors
│   ├── sniffer.py
│   ├── extractor.py
│   ├── state_inference.py
│   ├── kg_renderer.py
│   └── brief_renderer.py
├── llm/                     # LLM client wrappers
│   ├── claude.py            # Anthropic SDK wrapper
│   └── apple_ai.py          # HTTP client for sidecar
├── storage/                 # SQLAlchemy models + session management
│   ├── models.py
│   ├── session.py
│   └── migrations/          # Alembic
├── vault/                   # Obsidian filesystem layer
│   ├── reader.py
│   ├── writer.py
│   └── templates/           # Jinja2 markdown templates
└── config.py
```

### 4.2 MCP server

**Process**: Spawned by Claude Desktop on session start (per MCP convention) or run as a launchd daemon if shared with other MCP clients. v1 expects spawn-by-Claude-Desktop.

**Listens on**: stdio.

**Responsibilities**:
- Declare 10 universal MCP tools + a handful of work-domain-specific tools.
- For each tool call: optionally resolve names to IDs (one HTTP call to Loom Core), then proxy the actual request.
- Stream long responses if Claude Desktop expects them (briefs can be large).

**Tools** (full list in `loom-api-v1.md` § MCP tool mapping):
- `get_engagement_brief(domain, name, depth?, focus?)`
- `get_arena_brief(domain, name, depth?, focus?)`
- `get_open_commitments(domain, scope, owner?, days?)`
- `get_recent_decisions(domain, scope, days?)`
- `get_open_asks(domain, scope, side?)`
- `get_risk_register(domain, scope)`
- `get_pending_reviews(domain, scope?)`
- `get_atom_provenance(atom_id)`
- `get_notebook(name, version?)`
- `write_to_notebook(name, content, version_intent)`

### 4.3 Apple AI sidecar

**Process**: Single Swift process under launchd.

**Listens on**: `127.0.0.1:9101`.

**Responsibilities**:
- Expose endpoints that Loom Core calls when Apple Intelligence suffices for a task:
  - `POST /v1/summarize` — short summarization
  - `POST /v1/extract-tags` — tag generation from prose
  - `POST /v1/classify-domain` — migration domain classification
  - `POST /v1/clean-note` — migration pre-pass cleanup
  - `POST /v1/disambiguate` — simple stakeholder disambiguation
- Each endpoint accepts JSON, dispatches a `LanguageModelSession` with an appropriate `@Generable` Swift type, and returns the structured output.

**Why a sidecar and not embedded in the SwiftUI app**: the cron pipelines run regardless of whether the UI is open. The sidecar is daemon-style, available 24/7.

**Health endpoint**: `GET /v1/health` returns `{ "status": "ok", "model_loaded": true, "uptime_seconds": ... }`.

### 4.4 Loom UI

**Process**: User-launched SwiftUI app.

**Architecture**:
- `App` — root, sets up `LoomClient` (URLSession-based API client).
- `MainWindow` — split view: sidebar + detail.
- Views per resource: `EngagementListView`, `EngagementDetailView`, `HypothesisDetailView`, `TriageQueueView`, `MigrationReviewView`, `ProjectionLifecycleView`, `SettingsView`.
- ViewModels with `@Observable`. State lives in view models, not in views.
- Polling: every 30 seconds while the user is in the triage view; on user action elsewhere.

**API client**: simple `LoomClient` actor with one method per endpoint. Strongly-typed Swift structs decoded from JSON via `JSONDecoder` (camelCase ↔ snake_case via custom decoding strategy).

---

## 5. Data layer

Full DDL in `loom-schema-v1.sql`. Key facts:

- **Primary keys**: ULID (26-char strings) generated by Loom Core via `python-ulid`. Sortable, time-ordered, lexically indexable.
- **Tables**: 30+ tables organized into five sections (universal core, knowledge graph mirror, migration tracking, work projection, operational tracking).
- **WAL mode**: enabled for concurrent reads while Loom Core writes.
- **Partial unique indexes**: enforce atom anchor uniqueness within parent (event or artifact).
- **Polymorphic references**: `entity_pages`, `entity_tags`, `triage_items`, `stakeholder_roles.scope_id`, `atom_contributions.consumer_id`, `entity_visibility_members.entity_id` use `(entity_type, entity_id)` pairs; Loom Core enforces referential integrity at write time.
- **Soft delete**: dismissals (atoms, attachments) and closures (engagements, arenas, hypotheses) are timestamps, not hard deletes. Hard deletes reserved for retention triggers.
- **Migrations**: Alembic. `PRAGMA user_version` tracks DDL revisions.

### 5.1 Storage location

```
~/Library/Application Support/Loom/
├── db/
│   ├── loom.sqlite                      # main database
│   ├── loom.sqlite-wal                  # WAL file
│   └── loom.sqlite-shm                  # shared-memory file
├── logs/
│   ├── core.log
│   ├── apple-ai.log
│   └── mcp.log
└── config.toml                          # see § 8
```

The Loom vault lives separately at `~/Documents/Loom/` (or wherever the user places it inside iCloud Drive).

### 5.2 Backup strategy

- **Time Machine** covers `~/Library/Application Support/Loom/` (the SQLite database) and `~/Documents/Loom/` (the vault) automatically.
- **iCloud sync** provides offsite redundancy for the vault only.
- **Nightly SQLite backup**: Loom Core runs `VACUUM INTO` on a schedule, writing a timestamped `.sqlite` snapshot to `~/Library/Application Support/Loom/backups/`. Last 30 retained.

---

## 6. API layer

Full spec in `loom-api-v1.md`. Key facts:

- **Base URL**: `http://127.0.0.1:9100/v1`
- **Format**: JSON over HTTP/1.1
- **Authentication**: none (localhost-bound, single-user)
- **Pagination**: cursor-based
- **IDs**: ULIDs
- **Dates**: ISO 8601 with timezone
- **Error format**: `{ "error": { "code": "...", "message": "...", "details": {...} } }`
- **Versioning**: URL-prefixed (`/v1/`, future `/v2/`)
- **Real-time**: polling in v1; SSE deferred to v2

The API surface comprises six resource groups (Spine, Evidence, Triage, Briefs, Notebooks, Stakeholders) plus utility endpoints (`/migration`, `/external-references`, `/search`, `/health`, `/domains`, `/resources`).

### 6.1 Visibility model (v0.8)

Every state-bearing entity carries a `visibility_scope` column with four values: `private`, `engagement_scoped`, `stakeholder_set`, `domain_wide`. The rules:

- **`private`** — only Phani (the owner) sees it. Default for pre-attachment events and atoms.
- **`engagement_scoped`** — visible to all stakeholders with an active role on the parent engagement. Promoted at attachment time.
- **`stakeholder_set`** — visible to a specific named set, recorded in `entity_visibility_members`.
- **`domain_wide`** — visible to any audience querying that domain.

**Enforcement rule (blueprint §6.4):** every fact-returning read path applies visibility filtering at the SQL `WHERE` clause level via `loom_core.storage.visibility.visibility_predicate()`. Post-process filtering is never acceptable. Derived facts (atoms extracted from an event, atoms feeding a state change) inherit the most-restrictive scope of their sources via `derived_visibility()`.

When cognition (the `llm/` module) generates a brief or draft, atoms are filtered before reaching the LLM — the LLM never sees content the audience shouldn't see.

---

## 7. Knowledge graph layer

Every database write fans out to a markdown page in the vault. The KG generator runs in-process inside Loom Core, triggered after every successful write to a knowledge-graph-relevant entity (events, hypotheses, stakeholders, artifacts, arenas, engagements).

### 7.1 Page types

- **Event pages**: `outbox/work/events/{ulid}.md`. Atoms live as anchored sections (`## Decisions`, `## Commitments`, etc.), each with a visible block anchor like `^d-001`.
- **Hypothesis pages**: `outbox/work/hypotheses/{ulid}.md`. Lists state, attached atoms via wikilinks, attached stakeholders, state history.
- **Stakeholder pages**: `outbox/work/stakeholders/{ulid}.md`. Roles per domain, mentions (wikilinks), commitments owed.
- **Artifact pages**: `outbox/work/artifacts/{ulid}/current.md` and versioned at `versions/v_{n}.md`.
- **Arena and engagement pages**: minimal index pages with wikilinks to their hypotheses and engagements.
- **Brief pages**: `outbox/work/briefs/engagement/{ulid}_{date}.md`, `outbox/work/briefs/arena/{ulid}_{date}.md`.

### 7.2 Wikilink conventions

- Atom references: `[[event-{ulid}#^{anchor_id}]]` — links to the block anchor inside the parent event page.
- Hypothesis references: `[[hypothesis-{ulid}]]`.
- Stakeholder references: `[[stakeholder-{ulid}]]`.
- Arena/engagement references: `[[arena-{ulid}]]`, `[[engagement-{ulid}]]`.

Block anchors (`^d-001`) are visible in source mode and rendered preview, by design — when reading an event page, the atom IDs scan visually next to the prose they extract from.

### 7.3 Tags

- Universal tags: `#decision`, `#commitment`, `#ask`, `#risk`, `#status-update`, `#open`, `#closed`, `#dismissed`.
- Domain tags: `#work/account`, `#work/engagement`, `#work/aws-funded`, `#work/swim-lane/p2`, etc.
- LLM-generated tags: applied at write time by Apple AI (high-volume, low cost).

### 7.4 Render templates

Jinja2 templates in `loom_core/vault/templates/`:

- `event.md.j2`
- `hypothesis.md.j2`
- `stakeholder.md.j2`
- `artifact.md.j2`
- `brief_engagement.md.j2`
- `brief_arena.md.j2`

Templates are versioned via `entity_pages.render_version`. Bumping a template version forces a re-render of every affected page on the next nightly KG reconciliation.

---

## 8. Configuration

Single TOML file at `~/Library/Application Support/Loom/config.toml`:

```toml
# Loom v1 configuration

[core]
http_host = "127.0.0.1"
http_port = 9100
db_path = "~/Library/Application Support/Loom/db/loom.sqlite"
vault_path = "~/Documents/Loom"
log_level = "info"

[core.cron]
inbox_sweep_minutes = 5
state_inference_time = "06:30"
brief_engagement_time = "07:00"
brief_arena_day = "sunday"
brief_arena_time = "06:00"
kg_reconcile_time = "02:00"

[apple_ai]
http_host = "127.0.0.1"
http_port = 9101
enabled = true
fallback_to_claude_on_error = true

[claude]
# api_key loaded from environment variable ANTHROPIC_API_KEY
model_default = "claude-opus-4-7"
model_extraction = "claude-sonnet-4-6"  # cheaper for high-volume extraction
max_retries = 3
timeout_seconds = 60

[migration]
auto_accept_confidence_threshold = 0.85
batch_size = 50
preserve_originals_path = "archive/originals"

[outlook_mcp]
# Reuses the user's existing outlook-mcp configuration
config_path = "~/Library/Application Support/outlook-mcp/config.toml"

[backup]
sqlite_snapshot_count = 30
sqlite_snapshot_time = "03:00"

[logging]
core_path = "~/Library/Application Support/Loom/logs/core.log"
apple_ai_path = "~/Library/Application Support/Loom/logs/apple-ai.log"
mcp_path = "~/Library/Application Support/Loom/logs/mcp.log"
rotate_size_mb = 100
rotate_count = 5

[domains]
default = "work"

[domains.work]
display_name = "Work / CRO"
privacy_tier = "standard"
brief_engagement_enabled = true
brief_arena_enabled = true
```

The Anthropic API key is **not** in config; it loads from the environment variable `ANTHROPIC_API_KEY`. launchd plist sets the env var.

---

## 9. Deployment

### 9.1 Installation procedure

```bash
# 1. Prerequisites
# Ensure macOS 26.x, Apple Silicon, Xcode 26 installed, Apple Intelligence enabled.

# 2. Install uv (Python toolchain)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 3. Install Loom Core
git clone <repo>/loom-core ~/Code/loom-core
cd ~/Code/loom-core
uv sync                                  # creates .venv with pinned deps
uv run alembic upgrade head              # initialise database

# 4. Install MCP server
git clone <repo>/loom-mcp ~/Code/loom-mcp
cd ~/Code/loom-mcp
uv sync

# 5. Build Apple AI sidecar
git clone <repo>/loom-apple-ai ~/Code/loom-apple-ai
cd ~/Code/loom-apple-ai
swift build -c release
# Binary ends up at .build/release/loom-apple-ai

# 6. Build Loom UI
git clone <repo>/loom-ui ~/Code/loom-ui
cd ~/Code/loom-ui
xcodebuild -scheme LoomUI -configuration Release -derivedDataPath build
# App ends up at build/Build/Products/Release/Loom.app
# Optionally: copy to /Applications

# 7. Install launchd plists
cp ~/Code/loom-core/launchd/com.loom.core.plist ~/Library/LaunchAgents/
cp ~/Code/loom-apple-ai/launchd/com.loom.appleai.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.loom.core.plist
launchctl load ~/Library/LaunchAgents/com.loom.appleai.plist

# 8. Configure Claude Desktop to use the MCP server
# Edit ~/Library/Application Support/Claude/claude_desktop_config.json
# Add a "loom" server entry pointing at the MCP server's launch script.

# 9. Initial vault and config
mkdir -p ~/Documents/Loom/{inbox,notebooks,outbox,archive}/work
cp ~/Code/loom-core/config.example.toml ~/Library/Application\ Support/Loom/config.toml
# Edit config.toml to taste.

# 10. Set the API key
launchctl setenv ANTHROPIC_API_KEY "sk-ant-..."
# Or set in your shell profile and re-load the launchd plist.

# 11. Verify
curl http://127.0.0.1:9100/v1/health
curl http://127.0.0.1:9101/v1/health
```

### 9.2 launchd plist samples

`com.loom.core.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.loom.core</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/USERNAME/.local/bin/uv</string>
        <string>run</string>
        <string>--directory</string>
        <string>/Users/USERNAME/Code/loom-core</string>
        <string>uvicorn</string>
        <string>loom_core.main:app</string>
        <string>--host</string><string>127.0.0.1</string>
        <string>--port</string><string>9100</string>
        <string>--workers</string><string>1</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>ANTHROPIC_API_KEY</key>
        <string>sk-ant-...</string>
        <key>LOOM_CONFIG_PATH</key>
        <string>/Users/USERNAME/Library/Application Support/Loom/config.toml</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/USERNAME/Library/Application Support/Loom/logs/core.stdout</string>
    <key>StandardErrorPath</key>
    <string>/Users/USERNAME/Library/Application Support/Loom/logs/core.stderr</string>
</dict>
</plist>
```

`com.loom.appleai.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.loom.appleai</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/USERNAME/Code/loom-apple-ai/.build/release/loom-apple-ai</string>
        <string>--host</string><string>127.0.0.1</string>
        <string>--port</string><string>9101</string>
    </array>
    <key>RunAtLoad</key><true/>
    <key>KeepAlive</key><true/>
    <key>StandardOutPath</key>
    <string>/Users/USERNAME/Library/Application Support/Loom/logs/apple-ai.stdout</string>
    <key>StandardErrorPath</key>
    <string>/Users/USERNAME/Library/Application Support/Loom/logs/apple-ai.stderr</string>
</dict>
</plist>
```

### 9.3 Claude Desktop MCP config

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "loom": {
      "command": "/Users/USERNAME/.local/bin/uv",
      "args": [
        "run",
        "--directory",
        "/Users/USERNAME/Code/loom-mcp",
        "python",
        "-m",
        "loom_mcp.main"
      ],
      "env": {
        "LOOM_CORE_URL": "http://127.0.0.1:9100"
      }
    }
  }
}
```

---

## 10. Cron and scheduling

Two layers:

### 10.1 In-process scheduling (APScheduler inside Loom Core)

| Job | Cadence | Purpose |
|---|---|---|
| `inbox_sweep` | every 5 min | Scan `inbox/{domain}/` for new files; route them through sniffer → extractor → KG renderer. |
| `state_inference` | daily 06:30 | Read recent atoms per hypothesis; produce state-change proposals where evidence warrants. |
| `brief_engagement` | weekdays 07:00 | Pre-generate engagement-level briefs for active engagements. |
| `brief_arena` | Sunday 06:00 | Pre-generate arena (account) briefs for active arenas. |
| `kg_reconcile` | daily 02:00 | Walk all KG-relevant entities, re-render any whose `last_rendered_at < entity.last_modified_at`. |
| `sqlite_backup` | daily 03:00 | `VACUUM INTO` snapshot to backups directory. |
| `external_ref_verify` | weekly Mon 04:00 | Probe `external_references.url` for reachability; mark `unreachable` where appropriate. |

### 10.2 Event-driven scheduling

KG render is also triggered immediately after every successful write to an entity. The cron `kg_reconcile` is a safety net.

---

## 11. Logging and observability

### 11.1 Logging

- Format: structured JSON via `structlog` (Python) and `swift-log` with JSON formatter (Swift).
- Levels: debug, info, warning, error, critical.
- Default level: info.
- Rotation: 100MB per file, 5 files retained.

### 11.2 Health endpoints

- `GET http://127.0.0.1:9100/v1/health` — Loom Core: `{ status, version, db_size_bytes, uptime_seconds }`.
- `GET http://127.0.0.1:9100/v1/health/processor` — last cron run per pipeline.
- `GET http://127.0.0.1:9101/v1/health` — Apple AI sidecar: `{ status, model_loaded, uptime_seconds }`.

### 11.3 Diagnostics command

```bash
loom doctor
```

A small CLI shipped with Loom Core that runs:
- All three health endpoints
- Database file size and last `VACUUM` time
- Disk free under `~/Documents/Loom`
- Last successful run of each cron pipeline
- Any pending triage items count
- Any pending migration reviews count

### 11.4 Operations log (v0.8)

An append-only JSONL log at `/var/log/personal-os/loom-core/ops-{date}.jsonl`, rotated daily.

Each line: `{ op_id, op_type, timestamp, service, inputs_hash, status, details }`.

Status values: `started` | `completed` | `failed`.

**Purposes:**
- Replay on restart: the scheduler reads incomplete (`started` but not `completed`) ops from the last 24h and retries them.
- Audit trail for retractions, state-change proposals, and migration runs.
- Forensic debugging without reading the database.

Operations tracked: `inbox_sweep`, `atom_extraction`, `state_inference`, `brief_generation`, `kg_render`, `migration_batch`, `retraction`, `external_ref_verify`, `sqlite_backup`.

Implementation: `loom_core/observability/operations_log.py`. Called at the start and end of every pipeline run and every retraction. Issue #089.

---

## 12. Build, test, and development workflow

### 12.1 Local development

```bash
cd ~/Code/loom-core
uv run uvicorn loom_core.main:app --reload --host 127.0.0.1 --port 9100
```

In another terminal, the sidecar in dev mode:

```bash
cd ~/Code/loom-apple-ai
swift run loom-apple-ai --host 127.0.0.1 --port 9101
```

In another, the UI:

```bash
cd ~/Code/loom-ui
open Loom.xcodeproj
# Run from Xcode, scheme Loom (Debug)
```

### 12.2 Testing

- **Loom Core**: `uv run pytest`. Targets ≥80% coverage on services and pipelines; lower on API handlers (covered by integration tests).
- **MCP server**: `uv run pytest`. Each tool tested with a mocked Loom Core HTTP client.
- **Apple AI sidecar**: `swift test`. Unit tests for request/response schemas; integration tests against the on-device model.
- **Loom UI**: Swift Testing framework. ViewModel logic tested in isolation; UI tests via XCUITest for the triage flow.
- **End-to-end**: a small smoke test script that spins up Loom Core in a temp directory, ingests fixture data, hits each major API endpoint, verifies vault output.

### 12.3 Code quality

- Python: `ruff check`, `ruff format`, `mypy --strict`.
- Swift: `swiftformat` (config in repo), `swift-format` for compile-time checks.

---

## 13. Operations classification

The execution-tier matrix from the design phase, reproduced here as the operational contract. Loom Core's pipeline modules consult this table in code (`loom_core.config.tier_routing`):

| Stage | Python rules | ML / embeddings | Apple AI | Claude |
|---|---|---|---|---|
| Migration cleanup | Frontmatter | Domain classify | Pre-pass clean | Canonical rewrite |
| Sniff & route | File type | Ambiguous routing | — | — |
| Extract atoms | Statements, git, CSV | Dedup similarity | — | Prose extraction |
| Resolve entities | Email exact match | Fuzzy + embeddings | Simple cases | Complex cases |
| Infer state | Progress (rules) | — | — | Confidence reads |
| Generate KG | Wikilinks, tags | Backlink candidates | Tag generation | — |
| Render briefs | Templates | — | Section summaries | Executive narrative |

Routing rule: **anything user-visible at quality goes to Claude; anything high-volume or quality-tolerant goes to Apple AI**. Migration is the only stage where both LLMs are active.

### 13.1 Cognition module architecture (v0.8)

For v1, the cognition router, all provider adapters, and all stage implementations live as **modules inside `loom-core`** at `loom_core/llm/` — not as a separate service. The blueprint's polyglot decomposition (cognition as a standalone service) is a v2 extraction path, not a v1 target.

The v2 extraction trigger is a measurement, not an opinion: when the cost meter (`loom_core/llm/cost_meter.py`, issue #080) reports Claude API spend or per-call latency crossing a configurable threshold, the extraction is warranted. Until then, in-process cognition simplifies deployment and debugging.

Module layout: `router.py` (routing matrix), `providers/` (four adapters: python_rules, embeddings, apple_fm, claude_api), `stages/` (atom_extraction, identity_match, state_inference, brief_compose, draft_compose, overrides), `adversarial.py` (boundary tags, §13.8), `extraction_discipline.py` (confidence + source-grounding, §13.9), `cost_meter.py` (§13.7). The routing policy is loaded from `skills/routing-policy.yaml` and is the subject of the quarterly audit (issue #091).

**Privacy gate (§13.6):** private and stakeholder_set scoped facts never reach the Claude API tier. The router enforces this at call time by downshifting to Apple FM when the provider would otherwise be `claude_api`. A `LocalOnlyUnavailableError` is raised if no local provider can handle the stage — never silently downshifted to cloud.

---

## 14. Disaster scenarios and recovery

| Scenario | Detection | Recovery |
|---|---|---|
| Loom Core crash | launchd auto-restart; `health` endpoint stops responding | launchd restarts within seconds |
| Apple AI sidecar crash | Loom Core requests fail | launchd restarts; Loom Core falls back to Claude (`fallback_to_claude_on_error`) |
| SQLite corruption | `PRAGMA integrity_check` on startup fails | Restore from latest snapshot in `backups/`; re-run any pipelines since snapshot |
| Vault corruption (rare; iCloud sync) | KG render fails or vault diff explodes | Restore vault from Time Machine; trigger full KG re-render |
| iCloud sync conflict on inbox | Duplicate files appear with `<computer name>` suffix | Inbox sniffer detects, dedups; conflict resolution log written |
| Claude API outage | LLM-tier calls fail | Loom Core defers affected work; cron pipelines retry next cadence; brief generation falls back to template-only with banner indicating no narrative |
| Disk full | SQLite write fails | launchd surfaces error; `loom doctor` surfaces disk free; user clears space, Loom Core resumes |
| Migration LLM produces poor output | Two-tier confidence routes low-confidence rewrites to triage | User reviews; rerun on demand with different LLM choice |
| User accidentally edits canonical event page in Obsidian | KG render on next entity write overwrites; user sees their edits disappear | v1 mitigation: outbox is documented as read-only and pages carry a banner. v2: filesystem ACLs to make outbox read-only. |

---

## 15. v1 acceptance criteria

The build is "v1 done" when these are all true:

1. **Migration end-to-end** — All existing work-domain Obsidian vaults have been ingested via two-tier-confidence rewrite. Every original is archived. Low-confidence reviews queue is empty (or the user has explicitly accepted the remaining items).
2. **Daily capture working** — At least one Teams transcript, one dictation, one email, and one quick note successfully ingested per day for two weeks. Atoms extracted. Triage queue surfaces them.
3. **Triage ritual operational** — User completes a Friday triage in under 60 minutes for a typical week's volume. State-change proposals confirmed or overridden; atoms attached or dismissed.
4. **Brief generation reliable** — Engagement briefs render every weekday at 7am for every active engagement. Arena briefs render every Sunday at 6am. Failures surface in `loom doctor`.
5. **Knowledge graph alive** — Every entity has a vault page. Wikilinks resolve. Backlinks aggregate at the right level. Obsidian graph view shows the connections.
6. **Claude integration working** — `get_engagement_brief("work", "Panasonic Wave 2")` returns a brief in under five seconds. `get_atom_provenance` returns the source excerpt verbatim.
7. **No data loss in 30 days** — SQLite backup snapshots present for the last 30 days. Vault is in iCloud and Time Machine.
8. **Daemons stable** — All three daemons run for at least 14 consecutive days without manual restart.

---

## 16. Out of scope for v1 (deferred)

- **Other domains**: Finance, Content, Code, Health, Personal projections deferred to v2+. The schema and architecture support them; the projection tables and projection-specific atom types are not yet implemented.
- **Domain-specific atom types**: `audience_signal`, `exit_trigger`, `lesson`, `trade_off`, `transaction`, `metric_snapshot`, etc. — added per projection in v2+.
- **Cross-domain queries and insider-information firewall**: only matters once Finance lands.
- **App-level encryption-at-rest**: native macOS FileVault is the v1 protection. App-level column encryption is v2+ if Finance/Health domains demand it.
- **Mobile native UI**: iOS Loom UI is deferred. Mobile users get Obsidian iOS as the read fallback.
- **SSE for live updates**: polling is sufficient for v1.
- **Embedding-based semantic search**: SQLite FTS5 is sufficient for v1.
- **Multi-user / multi-tenant**: explicit non-goal.
- **External webhooks**: no system consumes Loom externally.
- **Claude on iPhone with MCP**: not until Anthropic ships Claude iOS with MCP support.

---

## 17. Glossary

- **Arena**: a domain-scoped grouping of related work. Work: account (e.g., Panasonic).
- **Atom**: an extracted fact. Five universal types: decision, commitment, ask, risk, status_update.
- **Block anchor**: an Obsidian markdown block ID (e.g., `^d-001`) that lets wikilinks target a specific section within a page.
- **Brief**: a generated synthesis at engagement or arena scope. Pre-generated on cron, augmentable on read.
- **Engagement**: bounded work within an arena. Work: a delivery wave, project, or ongoing support relationship.
- **Event**: an immutable record of something that happened. Process events (meetings), inbox-derived events (dictation), state-change events, etc.
- **Hypothesis**: a value-anchored claim with three-dimensional state (progress, confidence, momentum). The spine of the system.
- **Knowledge graph**: the network of wikilinks, tags, and backlinks across the vault, kept in sync with the structured store.
- **Notebook**: a versioned mutable artifact (research, brainstorm, draft, decision record).
- **Provenance**: the structural path from any state-bearing fact back to its source content (file path, transcript paragraph).
- **Stakeholder**: a global person record. Roles are scoped per domain.
- **Triage**: the human review of inferred state changes, low-confidence atoms, ambiguous routings, and migration outputs. Friday 4–5pm work-domain ritual.
- **Two-tier confidence migration**: the rewrite pipeline that auto-accepts high-confidence rewrites and queues low-confidence ones for human review.

---

## 18. References

- `loom-design.md` — concept and rituals
- `loom-blueprint.md` — universal core invariants
- `loom-projection-cro.md` — work projection (the only v1 projection)
- `loom-schema-v1.sql` — full SQLite DDL
- `loom-api-v1.md` — full HTTP API spec
- Anthropic SDK: https://github.com/anthropics/anthropic-sdk-python
- MCP SDK: https://github.com/modelcontextprotocol/python-sdk
- Foundation Models framework: https://developer.apple.com/documentation/FoundationModels
- FastAPI: https://fastapi.tiangolo.com
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/en/20/
- Vapor: https://vapor.codes

---

*End of v1 system design document.*
