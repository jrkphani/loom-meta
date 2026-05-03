# Loom v1 — Product Requirements Document

**Version:** 1.0 · **Date:** April 26, 2026 · **Author:** Phani
**Scope:** Work domain only · macOS 26 Tahoe · Apple Silicon
**Status:** Build-ready

---

## 0. About this document

This PRD is the **bridge between Loom's design corpus and its issue list.** It does not redefine the design; it states what we are building, who it is for, what success looks like, and how the work decomposes into vertical slices.

**The constitution:**

| Document | What it owns |
|---|---|
| `docs/loom-design.md` | Concept, principles, why |
| `docs/loom-blueprint.md` | Universal core invariants (cross-projection) |
| `docs/loom-system-design-v1.md` | Architecture, pinned versions, daemon topology — **authoritative** |
| `docs/loom-schema-v1.sql` | Data model (30+ tables) |
| `docs/loom-api-v1.md` | HTTP API surface (six resource groups) |
| `docs/loom-style-guide.md` | UI / vault rendering style |
| `docs/projections/cro.md` | Work-domain projection (only v1 projection) |

This PRD references the constitution; conflicts are resolved in the constitution's favour.

---

## 1. Problem statement

The CRO at 1CloudHub generates and consumes large volumes of evidence weekly across multiple accounts (Panasonic, Five Star, SMART, SaladStop, etc.) — Teams transcripts, emails, dictation, quick notes. The current toolkit (Outlook + Obsidian vaults + ad-hoc Claude conversations) produces three failure modes:

1. **Evidence is lost in transit.** A commitment made in a Teams call doesn't surface in Tuesday's prep for the next stakeholder meeting because the transcript was never re-read.
2. **State is interpreted, not evidenced.** *"How is Wave 2 going?"* gets answered from gut feeling rather than from the specific decisions, commitments, asks, and risks raised in the last fortnight.
3. **Inferences become facts.** Confidence reads about stakeholders (*"Madhavan is hardening"*) get treated as load-bearing without the provenance to back them up.

Loom is the substrate where these three failure modes are designed out.

**The metaphor:** a loom weaves fabric from threads. **Hypotheses** are the warp (lengthwise threads holding structure over time). **Events** are the weft (the daily crossings). **State** emerges from the interweaving. **Provenance** is the integrity of the weave.

---

## 2. Primary user

Loom v1 is single-user. The user is Phani.

**Operational context:**
- CRO at 1CloudHub (~10 SEA team members reporting in)
- 5–10 active customer engagements at any time
- 15–25 stakeholders actively tracked
- Weekly Teams meeting volume: 10–15 hours of transcript-eligible content
- Existing tooling: Obsidian (Mac + iOS), Outlook, Superwhisper, Claude Desktop, `outlook-mcp` (custom MCP server already configured)

**Surface preferences (use order):**
1. **Claude Desktop (Mac)** — primary. Direct queries via MCP.
2. **Obsidian Mobile** — fallback when Claude is unavailable.
3. **Obsidian Mac** — depth when detailed analysis is needed.
4. **Loom UI (SwiftUI)** — triage and projection-management surface; opened weekly, not daily.

**Behavioural commitment:** the user has agreed to the Friday 4–5pm triage ritual as a load-bearing precondition for Loom working at all. The system is designed around that cadence; no triage = degraded briefs.

---

## 3. Goals (v1)

Measurable outcomes that define "v1 done." All eight must hold simultaneously for ≥14 consecutive days.

| # | Goal | Measurement |
|---|---|---|
| G1 | **Migration end-to-end** | All existing work-domain Obsidian vaults ingested via two-tier-confidence rewrite. Originals archived. Low-confidence review queue empty or explicitly accepted. |
| G2 | **Daily capture working** | ≥1 Teams transcript, ≥1 dictation, ≥1 email, ≥1 quick note successfully ingested per day for two weeks. Atoms extracted. Triage queue surfaces them. |
| G3 | **Triage ritual operational** | User completes a Friday triage in <60 minutes for a typical week's volume. State-change proposals confirmed/overridden; atoms attached/dismissed. |
| G4 | **Brief generation reliable** | Engagement briefs render every weekday at 7am for active engagements. Arena (account) briefs render Sunday 6am. Failures surface in `loom doctor`. |
| G5 | **Knowledge graph alive** | Every entity has a vault page. Wikilinks resolve. Backlinks aggregate at the right level. Obsidian graph view shows connections. |
| G6 | **Claude integration working** | `get_engagement_brief("work", "Panasonic Wave 2")` returns a brief in <5 seconds. `get_atom_provenance` returns the source excerpt verbatim. |
| G7 | **No data loss in 30 days** | SQLite backup snapshots present for last 30 days. Vault is in iCloud and Time Machine. |
| G8 | **Daemons stable** | Loom Core, Apple AI sidecar, MCP server all run ≥14 consecutive days without manual restart. |

Source: `loom-system-design-v1.md` §15.

---

## 4. Non-goals (v1)

Stated to prevent scope creep:

- **Other domains.** Finance, Content, Code, Health, Personal projections are **deferred to v2+**. Schema and architecture support them; their projection tables and atom types do not ship now.
- **Domain-specific atom types.** `audience_signal`, `exit_trigger`, `lesson`, `trade_off`, `transaction`, `metric_snapshot` ship per projection in v2+.
- **Cross-domain queries / insider-information firewall.** Only matters once Finance lands.
- **App-level encryption-at-rest.** macOS FileVault is the v1 protection. Column-level encryption is v2+ if/when Finance/Health demand it.
- **Mobile native UI.** No iOS Loom UI. Mobile users get Obsidian iOS as the read fallback.
- **SSE for live updates.** Polling (30s in triage view, on-action elsewhere) is sufficient for v1.
- **Embedding-based semantic search.** SQLite FTS5 is sufficient.
- **Multi-user / multi-tenant.** Explicit non-goal.
- **External webhooks.** No system consumes Loom externally.
- **Claude on iPhone with MCP.** Out of our control; reachable when Anthropic ships it.

Source: `loom-system-design-v1.md` §16.

---

## 5. User stories

Grouped by workstream. Each story has a numeric ID (`US-N`) referenced by issue files.

### 5.1 Capture (events)

- **US-1.** *As Phani, I drop a Teams transcript file (or `outlook-mcp` pulls it on cron) into `inbox/work/` and within 5 minutes it appears as a process event in the structured store with atoms extracted.*
- **US-2.** *As Phani, I dictate a quick post-meeting note into Obsidian Mobile (`inbox/work/dictation/`); within minutes after iCloud syncs, it appears as an inbox-derived event with atoms extracted.*
- **US-3.** *As Phani, I forward an email excerpt or paste a typed quick note into the inbox; the sniffer routes it correctly with confidence; low-confidence routes flag for review.*
- **US-4.** *As Phani, when I paste an email message ID from Outlook, Loom captures the message ID as a live link plus a snapshot of the finding — the original stays in Outlook, never duplicated into Loom.*

### 5.2 Migration

- **US-5.** *As Phani, I point Loom at my existing work-domain Obsidian vaults and trigger a migration batch; the system uses two-tier-confidence rewriting (Apple AI pre-pass, Claude API canonical rewrite) to produce structured atoms and events.*
- **US-6.** *As Phani, I review low-confidence migration outputs in the Loom UI; I accept, reject, or hand-edit each; my decisions feed forward to improve future migration.*
- **US-7.** *As Phani, when migration completes, every original artifact is preserved in `archive/originals/` so I can always reach back to the un-rewritten source.*

### 5.3 Spine (arenas, engagements, hypotheses)

- **US-8.** *As Phani, I create a new account (arena) with industry, region, AWS segment, and customer type metadata.*
- **US-9.** *As Phani, I create an engagement under an account (delivery wave, project, or ongoing support) with SOW value, AWS-funded flag, and swim-lane classification.*
- **US-10.** *As Phani, I create engagement-level hypotheses (3–7 per engagement, per the projection's discipline) with title and description.*
- **US-11.** *As Phani, I create account-level hypotheses for long-arc bets that span engagements.*
- **US-12.** *As Phani, when I close an engagement, the system warns me about open hypotheses; I can force-close with the open state captured in the close response.*

### 5.4 Atoms and triage

- **US-13.** *As Phani, on Friday 4–5pm I open the Loom UI and see the triage queue: pending hypothesis-state proposals, candidate atoms ranked per active hypothesis, unattached events.*
- **US-14.** *As Phani, I attach an atom to a hypothesis with one tap; or dismiss it as not relevant with a reason; or flag it as ambiguous.*
- **US-15.** *As Phani, I confirm a state-change proposal (the system shows its reasoning and the atoms behind it); or I override with a one-line "why" — that override is the highest-value training signal in the system.*
- **US-16.** *As Phani, when an engagement triage is skipped, the next cycle's surface flags the backlog: "two weeks since last triage on Panasonic Wave 2 — N atoms, M proposals pending."*
- **US-17.** *As Phani, after three consecutive skipped triage cycles on an engagement, the system stops generating new state-change proposals for it (degrades gracefully) until I resume triage.*

### 5.5 Briefs

- **US-18.** *As Phani, every weekday at 7am, engagement briefs are pre-generated as Obsidian markdown for every active engagement.*
- **US-19.** *As Phani, every Sunday 6am, account-level briefs are pre-generated for every active account.*
- **US-20.** *As Phani, when I ask Claude `get_engagement_brief("work", "Panasonic Wave 2")`, I get the executive view (hypothesis state with progress/confidence/momentum, top atoms since last review, anything pending review) in under 5 seconds.*
- **US-21.** *As Phani, briefs distinguish progress (fact, evidence-sovereign) from confidence and momentum (interpretive, time-stamped, marked when inferred-but-unreviewed).*
- **US-22.** *As Phani, briefs serve dual duty: 30-second pre-meeting scan AND 5–10-minute desk pre-read using the same artifact (layered).*
- **US-23.** *As Phani, when Claude is unavailable, I open the latest pre-generated brief in Obsidian Mobile and get the same content read-only.*

### 5.6 MCP and Claude integration

- **US-24.** *As Phani in a Claude Desktop conversation, I have 10+ universal MCP tools available: `get_engagement_brief`, `get_arena_brief`, `get_open_commitments`, `get_recent_decisions`, `get_open_asks`, `get_risk_register`, `get_pending_reviews`, `get_atom_provenance`, `get_notebook`, `write_to_notebook`.*
- **US-25.** *As Phani, when I ask Claude "show me where this came from" about any atom, `get_atom_provenance` returns the source excerpt (transcript paragraph, email message ID + snapshot, dictation file).*
- **US-26.** *As Phani, I can compose a notebook artifact (research, brainstorm, draft, decision record) by asking Claude to `write_to_notebook` — version snapshots are kept; the artifact may later generate a publication event.*

### 5.7 Stakeholders

- **US-27.** *As Phani, stakeholders resolve cleanly via email addresses (customer domains, `@amazon.com`, `@1cloudhub.com`); free-text mentions ("Madhavan said...") flag for stakeholder review.*
- **US-28.** *As Phani, I review the stakeholder resolution queue when uncertainty is flagged; I confirm the canonical record or split into two; my decisions train future resolution.*
- **US-29.** *As Phani, a stakeholder is global (one entity); their role labels are scoped per domain (sponsor in work, advisor in finance, etc.) — no information leakage.*

### 5.8 Knowledge graph (vault rendering)

- **US-30.** *As Phani, every database write fans out to a markdown page in `outbox/work/` with visible block anchors, wikilinks, and tags — Obsidian's graph view becomes a working surface.*
- **US-31.** *As Phani, atoms inside event pages have visible block anchors (`^d-001`) so wikilinks can target the specific section where an atom was extracted.*
- **US-32.** *As Phani, the nightly KG reconciliation (2am) re-renders any page whose template version has bumped, so style changes propagate.*

### 5.9 Operations

- **US-33.** *As Phani, I run `loom doctor` and see: all three daemon health endpoints, last cron run per pipeline, disk free under `~/Documents/Loom`, pending triage count, pending migration review count.*
- **US-34.** *As Phani, the three daemons (Loom Core, Apple AI sidecar, MCP server) are managed by launchd; crashes auto-restart.*
- **US-35.** *As Phani, SQLite backups (`VACUUM INTO`) run nightly at 3am; last 30 retained.*
- **US-36.** *As Phani, when the Apple AI sidecar fails, Loom Core falls back to Claude API for the same task (`fallback_to_claude_on_error = true`).*
- **US-37.** *As Phani, when the Claude API is unreachable, brief generation falls back to template-only output with a banner indicating no narrative; cron retries next cadence.*

### 5.10 UI (SwiftUI)

- **US-38.** *As Phani, the Loom UI has a sidebar (Engagements / Hypotheses / Triage / Migration / Settings) and a detail pane.*
- **US-39.** *As Phani, the triage view polls every 30 seconds while open so the queue updates without manual refresh.*
- **US-40.** *As Phani, the migration review screen shows side-by-side original vs. rewritten content with a confidence score and accept/reject/edit controls.*

---

## 6. Implementation decisions (locked-in)

These decisions are settled. They do not get re-litigated during implementation. Issues that propose changing any of these require an RFC.

### 6.1 Stack

| Component | Choice | Rationale |
|---|---|---|
| Backend daemon | **Python 3.13.13** (FastAPI 0.115 + SQLAlchemy 2.0 async + Alembic + uvicorn) | LLM ecosystem maturity; matches existing `outlook-mcp` continuity decision (Python preferred over Node for extractor work). |
| Package manager | **uv** | Fast, reproducible, replaces pip+venv. |
| Storage | **SQLite 3.43+** WAL mode | Single-writer guarantee (one uvicorn worker), Mac-local, never on iCloud. |
| Identifiers | **ULIDs** (26-char Crockford base32) via `python-ulid` | Sortable, time-ordered, lexically indexable. |
| Markdown | `python-frontmatter` + `mistune` (parsing) + `jinja2` (templating) | Vault is the knowledge graph; KG render is first-class. |
| MCP server | **Python 3.13** + `mcp` SDK (FastMCP API) + `httpx` | Thin wrapper over Loom Core HTTP API; ~300–500 LOC. |
| Apple AI sidecar | **Swift 6** + Vapor 4 + `FoundationModels` (macOS 26) | On-device LLM for high-volume / quality-tolerant tasks (tags, summaries, classify, clean-note, simple disambiguation). |
| UI | **SwiftUI** (macOS 26 native) + `@Observable` view models + URLSession | Triage and migration-review surface; not the primary product (MCP is). |
| LLM tier-routing | Operations classification matrix (system design §13) | Anything user-visible at quality → Claude; high-volume / quality-tolerant → Apple AI. |
| Logging | `structlog` (Python) + `swift-log` JSON formatter (Swift) | Structured JSON, rotated 100MB × 5 files. |
| Config | Single TOML at `~/Library/Application Support/Loom/config.toml` | API key from env (`ANTHROPIC_API_KEY`), launchd plist sets it. |
| Process management | **launchd** | macOS-native; survives reboot; auto-restart. |

### 6.2 Architecture invariants

- **Loom Core is the sole writer** to SQLite and to `outbox/`. No other process opens the database directly. No other process writes to `outbox/`.
- **Single uvicorn worker** for Loom Core. Single-writer guarantee across the API surface.
- **HTTP/1.1 over localhost** for inter-process IPC (Loom UI ↔ Loom Core, MCP server ↔ Loom Core, Loom Core ↔ Apple AI sidecar). Stdio only for Claude Desktop ↔ MCP server.
- **Events are immutable.** No PATCH or DELETE on events. Atoms can be revised pre-attachment; commitments/asks/risks have lifecycle status updates that write `atom_status_changes` rows.
- **Soft delete only** for dismissals and closures. Hard deletes reserved for retention triggers and explicit NDA-driven hard-deletes.
- **Polymorphic references via `(entity_type, entity_id)` pairs** in `entity_pages`, `entity_tags`, `triage_items`, `stakeholder_roles.scope_id`, `atom_contributions.consumer_id`, `entity_visibility_members.entity_id`. Loom Core enforces referential integrity at write time (SQLite cannot).
- **Domain is a first-class column** on every entity. Privacy is enforced at the query layer.

### 6.3 Vault layout

```
~/Documents/Loom/                        # iCloud-synced
├── inbox/work/{dictation,emails,notes,transcripts}/
├── notebooks/work/{ulid}/{current.md,versions/v_{n}.md}
├── outbox/work/{events,hypotheses,stakeholders,artifacts,arenas,engagements,briefs}/
└── archive/work/originals/              # migration preserves originals here
```

### 6.4 Cron schedule (in-process via APScheduler)

| Job | Cadence | Owner |
|---|---|---|
| `inbox_sweep` | every 5 min | sniffer + extractor + KG renderer |
| `state_inference` | daily 06:30 | per-hypothesis state-change proposals |
| `brief_engagement` | weekdays 07:00 | engagement briefs |
| `brief_arena` | Sunday 06:00 | arena (account) briefs |
| `kg_reconcile` | daily 02:00 | re-render where template version bumped |
| `sqlite_backup` | daily 03:00 | `VACUUM INTO` snapshot |
| `external_ref_verify` | weekly Mon 04:00 | probe external URLs for reachability |

### 6.5 Out-of-process IPC

- **Claude Desktop** spawns the MCP server per session via stdio (per MCP convention).
- **Loom UI** is user-launched; HTTP client only.
- **`outlook-mcp`** is reused via the user's existing config; called by Loom Core as a subprocess or HTTP client.

---

## 7. Workstreams

How the work decomposes into roughly-orthogonal tracks. Each workstream produces a cluster of issues. Issues within a workstream often have hard `blocked-by` dependencies; cross-workstream dependencies are looser.

### W1. Foundation (loom-core skeleton)

**Goal:** Loom Core daemon runs, exposes `/health`, has Alembic migrations applied, has a working test harness.

**Issues, rough count:** 4–6
- Repo scaffold: `pyproject.toml`, `uv` env, ruff/mypy/pytest config, `src/loom_core/` package.
- FastAPI app skeleton + `/v1/health` endpoint.
- Alembic init + first migration: schema sections 1 (universal core) + 5 (operational tracking).
- SQLAlchemy session + async session factory.
- launchd plist + `loom doctor` CLI skeleton.
- CI gates (or local-equivalent): `uv run ruff check && uv run mypy --strict && uv run pytest`.

**Verification gate:** `curl http://127.0.0.1:9100/v1/health` returns `{ "status": "ok", "version": "1.0.0", ... }`.

### W2. Spine (arenas → engagements → hypotheses)

**Goal:** the value-anchored hierarchy is creatable, listable, closable through the API. **This contains the T1 first tracer bullet.**

**Issues, rough count:** 6–8
- **T1 — first tracer bullet:** create + list engagements (with arena dependency) + MCP `list_engagements` tool + integration test. **AFK.** Touches: schema (engagements + arenas), service, route, MCP, test.
- Arenas CRUD + close + work_account_metadata.
- Engagements CRUD + close + work_engagement_metadata + force-close semantics.
- Hypotheses CRUD + close (terminal_state) + layer constraint.
- Hypothesis state operations: GET state, GET history, GET proposals.
- Hypothesis state proposal confirm/override.
- Domain seeding migration (`work` row).

**User stories addressed:** US-8, US-9, US-10, US-11, US-12, US-15.

### W3. Capture (events, atoms)

**Goal:** content lands in `inbox/work/`, gets routed by sniffer, atoms get extracted, KG pages render.

**Issues, rough count:** 8–10
- Events CRUD (POST only; immutable — no PATCH/DELETE).
- Atom schema: universal types (decision, commitment, ask, risk, status_update) + type-specific detail tables.
- Inbox sniffer (file-type detection, frontmatter parsing, confidence routing).
- Atom extractor — Claude tier (prose extraction).
- Atom extractor — Apple AI tier (high-volume tagging, summaries).
- Atom extractor — Python rules tier (statements, git, CSV).
- External-reference table + live-link-plus-snapshot pattern.
- `outlook-mcp` integration (Teams transcript pull, email message-ID retention).
- `inbox_sweep` cron job wiring.

**User stories addressed:** US-1, US-2, US-3, US-4, US-25 (provenance return).

### W4. Triage core (atom attachments, dismissals)

**Goal:** the Friday triage workflow works end-to-end through the API.

**Issues, rough count:** 5–7
- Atom attachments table + attach/detach endpoints + ambiguity flag.
- Dismissal endpoints (atom-global, attachment-scoped) + `atom_attachments.dismissed`.
- Triage items table + populate via cron (state proposals + low-confidence atoms + ambiguous routes).
- `GET /triage` queue endpoint with prioritisation.
- Skip-handling: backlog warnings, three-strikes degrade gracefully.
- Override-reason capture (the highest-value training signal).

**User stories addressed:** US-13, US-14, US-15, US-16, US-17.

### W5. State inference

**Goal:** the cron-based state-change proposal pipeline produces reviewable inferences.

**Issues, rough count:** 4–6
- Progress dimension: rules-based inference from attached atoms.
- Confidence dimension: Apple AI / Claude reads with reasoning capture.
- Momentum dimension: same.
- Reasoning artifact storage (the inference is reviewable, not just the new state).
- `state_inference` cron job at 06:30.
- Inferred-vs-confirmed flag enforcement on read surfaces.

**User stories addressed:** US-15, US-21.

### W6. Knowledge graph render

**Goal:** every entity has a vault page; wikilinks resolve; backlinks aggregate; templates are versioned.

**Issues, rough count:** 5–7
- KG render dispatcher + `entity_pages` table.
- Event page template (with block anchors for atoms).
- Hypothesis page template.
- Stakeholder page template.
- Artifact page template (versioned).
- Arena/engagement index pages.
- Brief page templates (engagement + arena).
- `kg_reconcile` nightly cron.

**User stories addressed:** US-30, US-31, US-32.

### W7. Briefs

**Goal:** engagement and arena briefs render on schedule and are queryable via Claude.

**Issues, rough count:** 4–5
- Brief render service (top + drill-down layers).
- Engagement brief template + cron 07:00 weekdays.
- Arena brief template + cron 06:00 Sunday.
- Brief MCP tool integration: `get_engagement_brief`, `get_arena_brief`.
- Claude-API narrative generation (executive view) with template fallback on outage.

**User stories addressed:** US-18, US-19, US-20, US-22, US-23, US-37.

### W8. Stakeholders

**Goal:** stakeholders resolve cleanly via email; uncertainty surfaces in a review queue.

**Issues, rough count:** 4–5
- Stakeholders table + roles table (scoped per domain).
- Resolution: email exact match (Python rules tier).
- Resolution: fuzzy + embeddings (`rapidfuzz` + `sentence-transformers`).
- Resolution: complex cases via Claude.
- Stakeholder review queue surfacing.

**User stories addressed:** US-27, US-28, US-29.

### W9. Migration

**Goal:** existing Obsidian vaults import via two-tier-confidence rewriting; originals preserved; low-confidence reviewable.

**Issues, rough count:** 6–8
- Migration source discovery + batching.
- Frontmatter parsing.
- Domain classification (Apple AI tier).
- Pre-pass cleanup (Apple AI tier).
- Canonical rewrite (Claude tier).
- Two-tier confidence threshold + auto-accept rule.
- Originals archive.
- Review queue + accept/reject/edit endpoints.
- Migration UI (in W11).

**User stories addressed:** US-5, US-6, US-7.

### W10. MCP server (loom-mcp)

**Goal:** Claude Desktop has 10+ tools wired to Loom Core API.

**Issues, rough count:** 4–6
- Repo scaffold: `pyproject.toml`, `uv` env, FastMCP setup.
- Tool: `list_engagements` (lands in T1).
- Tool: `get_engagement_brief`, `get_arena_brief`.
- Tools: `get_open_commitments`, `get_recent_decisions`, `get_open_asks`, `get_risk_register`, `get_pending_reviews`.
- Tools: `get_atom_provenance`, `get_notebook`, `write_to_notebook`.
- Name → ULID resolution layer (helpful for natural-language tool calls).
- Claude Desktop config + spawn-per-session verification.

**User stories addressed:** US-24, US-25, US-26.

### W11. UI (loom-ui — SwiftUI)

**Goal:** triage and migration-review surfaces work; user can complete a Friday triage in <60 minutes.

**Issues, rough count:** 8–10
- Repo scaffold: `Package.swift`, Xcode project, `LoomClient` actor.
- Sidebar + detail-pane shell.
- Engagements list view + detail view.
- Hypothesis detail view (state, attached atoms, history).
- Triage queue view + attach/dismiss/confirm/override actions.
- Migration review view (side-by-side original vs. rewritten).
- Polling: 30s in triage view, on-action elsewhere.
- Settings view + projection lifecycle view.

**User stories addressed:** US-13, US-14, US-15, US-38, US-39, US-40.

### W12. Apple AI sidecar (loom-apple-ai)

**Goal:** on-device LLM endpoints available to Loom Core for high-volume tasks; fallback-to-Claude on error.

**Issues, rough count:** 5–7
- Repo scaffold: `Package.swift`, Vapor app, launchd plist.
- `POST /v1/summarize`, `POST /v1/extract-tags`, `POST /v1/classify-domain`, `POST /v1/clean-note`, `POST /v1/disambiguate`.
- `LanguageModelSession` integration + `@Generable` types.
- Health endpoint.
- Loom Core HTTP client (`loom_core/llm/apple_ai.py`) with fallback semantics.

**User stories addressed:** US-36 (fallback), and underlies W3, W5, W7, W9.

### W13. Operations

**Goal:** the system runs unattended; failures are visible; recovery paths exist.

**Issues, rough count:** 4–6
- `loom doctor` CLI: full diagnostics.
- launchd plists for both daemons.
- SQLite backup cron + retention.
- Health endpoints (Loom Core + processor + Apple AI).
- Disaster recovery runbook (system design §14).
- Log rotation verification.

**User stories addressed:** US-33, US-34, US-35, US-36, US-37.

### W14. Architecture review

**Goal:** after the spine + capture + triage land (W1–W4 done), run `/improve-codebase-architecture` to surface shallow modules before the system grows further.

**Issues, rough count:** 1 RFC issue, then whatever it generates.

**Trigger:** at the end of W4 (triage core complete).

**Status (May 2026):** Superseded by W15–W18. The v0.8 alignment refactor (executed early because Loom is being repositioned as the structural store under Personal OS / Life OS) is the architecture-review output. See #075 (marked superseded) and #092 (blueprint reconciliation).

### W15. v0.8 alignment — schema + visibility (Phase A)

**Goal:** Bring loom-core into structural alignment with Personal OS blueprint v0.8. Single consolidated schema migration adds visibility, retention, projection-at-creation, model-version metadata, role periods, audience profile, forward-provenance, and resources. Visibility filter library lands as the canonical implementation; every read path uses it. Visibility regression tests join the CI gates.

**Issues, rough count:** 4
- #076 v0.8 consolidated schema migration (HITL — touches every operational table)
- #077 visibility filter library + Audience type
- #078 read-path retrofit (audience-aware reads across 7 service files)
- #079 visibility regression test suite + new CI gate

**Verification gate:** `pytest -m visibility` passes; `alembic check` passes; `python -m loom_core.cli doctor` passes post-migration.

**User stories addressed:** none directly (foundational); unblocks every downstream user story by establishing the privacy boundary structurally.

### W16. v0.8 alignment — cognition + accountability (Phase B)

**Goal:** Fill the empty `llm/` module with the cognition router, provider adapters, adversarial-input handling, and extraction discipline. Forward provenance (`atom_contributions`) writes on every consumer. Atom retraction endpoint cascades through forward provenance.

**Issues, rough count:** 5
- #080 cognition module skeleton (router, providers, routing-policy.yaml)
- #081 adversarial input boundary tags + system instruction
- #082 extraction discipline (confidence + source-grounding)
- #083 forward-provenance writes (atom_contributions on every consumer)
- #084 atom retraction endpoint + cascade walk

**Verification gate:** all four CI gates plus visibility regression. Privacy-gate test asserts a private event never reaches Claude API.

**User stories addressed:** US-15 (extends override-as-training-signal with retraction-as-correction), and unblocks W3 atom extractors (#010–#012 amendments) and W5 state inference (#023–#026 amendments).

### W17. v0.8 alignment — resources + standards + roles (Phase C)

**Goal:** Land the leverage layer (resources + attribution), the standards module (with 1CloudHub brand seed + sunset policy), and the projection-agnostic stakeholder roles + audience profile. Brief composition gains a leverage section.

**Issues, rough count:** 4
- #085 resources entities + time/people inference
- #086 resource attribution + brief leverage section
- #087 standards module + 1CloudHub brand seed + sunset policy
- #088 stakeholder roles (time-bounded) + audience profile (replaces #039)

**Verification gate:** all four CI gates. Leverage-section integration test asserts audience filtering on resource attributions.

**User stories addressed:** US-18, US-22 (extends brief content with leverage), US-27, US-29 (re-implements with v0.8 model — replaces #039).

### W18. v0.8 alignment — operations rigor (Phase D)

**Goal:** Append-only operations log, idempotency-key middleware, and the quarterly routing-matrix audit. Closes the loop on §11.9 (operations are idempotent and replayable) and §13.4 (cognition routing matrix drift detection).

**Issues, rough count:** 3
- #089 operations log (JSONL append + replay-on-startup)
- #090 idempotency-key middleware + cache
- #091 quarterly routing-matrix audit job

**Verification gate:** all four CI gates plus operations-log shape validation.

**User stories addressed:** none directly (operational hardening).

### Architecture decomposition (v0.8 alignment)

The v0.8 alignment consciously deviates from the original blueprint's polyglot decomposition. v1 ships as **single Python service (loom-core) + msgvault Swift services + desktop/mobile Swift apps + web-clipper TS extension** — polyglot count of 3, not 4. Cognition, contacts, and standards live as **modules inside loom-core** for v1; extracted to separate services in v2 if rule volume / extraction load justify it. Sequencing: W15 lands first (schema unblocker), then W16 in parallel with resumption of W3, then W17, then W18. See `docs/v08-blueprint-reconciliation.md` (lands in #092) for the full reconciliation note.

### Workstream rough total

~92–117 issues across 18 workstreams (W1–W14 original plus W15–W18 v0.8 alignment). Most are AFK; HITL exceptions are flagged in §9 below.

W15–W18 add 17 new issues (#076–#092) plus addenda to 14 existing issues (#010, #011, #012, #013, #017, #018, #023, #024, #025, #026, #035, #036, #038, #075). Issue #039 is replaced by #088.

---

## 8. Vertical slice strategy

A tracer bullet for Loom v1 cuts through these layers:

```
Schema (SQLAlchemy model + Alembic migration)
    ↓
Service (loom_core/services/*.py)
    ↓
API route (loom_core/api/*.py)
    ↓
KG render (loom_core/vault/writer.py + Jinja2 template)
    ↓
MCP tool (loom-mcp/src/loom_mcp/tools/*.py)
    ↓
Integration test (loom-core test hits API; loom-mcp test hits tool through mocked HTTP client)
```

The SwiftUI surface is **not** part of every tracer bullet — most slices land through the API + MCP first, and the UI catches up in W11. This is deliberate: Claude Desktop is the primary surface, so an end-to-end slice through MCP is more representative than one through SwiftUI.

**Issue authoring template** (per workshop guide §6.2):

```markdown
# NNN — <short title>

**Workstream:** W<n>
**Tag:** AFK | HITL
**Blocked by:** #NNN, #NNN
**User stories:** US-<n>, US-<n>

## Behaviour
What changes from the user's perspective. Not a layer-by-layer recipe.

## Acceptance criteria
- [ ] Specific, testable.
- [ ] One per logical assertion.

## Notes
Anything the implementer needs but that isn't acceptance-bearing.
```

---

## 9. AFK / HITL classification

**Default: AFK.** Most work is unambiguous and Ralph-runnable.

**HITL exceptions** (decisions or external setup that automation cannot verify):

| Issue type | Why HITL |
|---|---|
| Repo scaffolds (loom-core, loom-mcp) | First-time tooling setup; needs human eyes on `pyproject.toml` choices and CI gates. |
| Schema decisions that diverge from `loom-schema-v1.sql` | The schema is locked; deviations require human RFC. |
| Anything touching `ANTHROPIC_API_KEY` setup | Credential handling; not auto-verifiable. |
| Claude Desktop MCP config installation | One-time, environment-specific. |
| launchd plist installation + load | One-time, environment-specific. |
| Apple AI sidecar first build | Requires Xcode 26 + Apple Intelligence enabled; environment-specific. |
| Architecture review (W14) | Output is an RFC; needs human read. |
| `outlook-mcp` integration (first wiring) | Reuses user's existing config; needs human-verified auth. |
| Migration of real vault data | Irreversible-ish; user reviews low-confidence outputs. |
| Anything that violates an "implementation decisions" lock-in | Requires explicit RFC. |

Everything else is AFK.

---

## 10. Testing decisions

### 10.1 Test pyramid per repo

**loom-core:**
- **Unit tests** (`tests/unit/`): pure functions, Pydantic models, Jinja2 template rendering, sniffer rules. Fast.
- **Service tests** (`tests/services/`): exercise services through their public interface against an in-memory SQLite. No HTTP layer.
- **API tests** (`tests/api/`): exercise FastAPI app via `httpx.AsyncClient` against a temp-file SQLite. Cover happy paths + error codes (`VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `UNPROCESSABLE_ENTITY`).
- **Integration tests** (`tests/integration/`): end-to-end through Loom Core with vault + Obsidian fixture; verify KG render side-effects.
- **Coverage target:** ≥80% on `services/` and `pipelines/`. Lower acceptable on `api/` (covered by integration tests).

**loom-mcp:**
- Each tool tested with a mocked Loom Core HTTP client.
- One end-to-end smoke test that spins up Loom Core in a temp dir, hits each tool through the MCP layer.

**loom-apple-ai (W12):**
- Unit tests for request/response schemas (`swift test`).
- Integration tests against the on-device model (skip CI; run locally where macOS 26 is available).

**loom-ui (W11):**
- ViewModel logic tested in isolation (Swift Testing).
- UI tests for the triage flow via XCUITest.

### 10.2 What gets mocked, what stays real

Per workshop guide §4.3:

| Boundary | Strategy |
|---|---|
| SQLite | **Real** (in-memory or temp-file). Never mocked. |
| Apple AI sidecar | **Mocked** at the HTTP-port boundary in service/api/integration tests. Real only in W12 integration tests. |
| Claude API | **Mocked** at the SDK boundary in all tests. Real only in a small set of opt-in `tests/external/` runs. |
| `outlook-mcp` | **Mocked** at the subprocess/HTTP boundary. Real only in opt-in tests. |
| Time / clock | **Injected** (`get_now: () => datetime`). Mocked in tests where time matters (cron, retention tiers, staleness). |
| Filesystem (vault) | **Real**, in temp dirs. Never mocked. |
| Loom's own modules | **Never mocked.** Tested through the real interface. |

### 10.3 Verification gates (per repo)

```bash
# loom-core
uv run ruff check
uv run ruff format --check
uv run mypy --strict
uv run pytest
uv run pytest -m visibility    # v0.8 alignment (W15) — visibility regression tests
uv run alembic check           # v0.8 alignment (W15) — ORM matches latest migration head
uv run pytest -m operations_log # v0.8 alignment (W18) — operations log shape validation

# loom-mcp
uv run ruff check
uv run mypy --strict
uv run pytest

# loom-apple-ai (W12)
swift build
swift test

# loom-ui (W11)
xcodebuild test -scheme LoomUI
```

A task is not complete until all gates relevant to its repo pass with zero errors.

### 10.4 Fixtures

Shared test fixtures live in each repo's `tests/fixtures/`:
- `tests/fixtures/transcripts/` — small, anonymised Teams transcript samples.
- `tests/fixtures/dictation/` — short dictation files.
- `tests/fixtures/emails/` — email samples (subject + sender + body).
- `tests/fixtures/migration/` — small Obsidian vault samples for migration testing.
- `tests/fixtures/atoms.json` — golden atom-extraction outputs for snapshot tests.

Real customer data **never** lands in fixtures. Anonymised or synthetic only.

---

## 11. Acceptance criteria (v1)

The build is "v1 done" when **all of G1–G8 (§3) hold simultaneously for ≥14 consecutive days.**

These are reproduced from `loom-system-design-v1.md` §15. They are the contract that closes v1.

---

## 12. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | **Triage ritual doesn't take root.** Recall-favouring extraction puts large queues in front of the user; if the Friday block is missed repeatedly, briefs degrade. | Three-strikes degradation (US-17). Backlog warnings (US-16). Time budget enforced (≤10 min per active engagement). |
| R2 | **Apple AI sidecar instability** on early-cycle macOS 26 / Foundation Models. | Fallback-to-Claude is wired from day 1 (`fallback_to_claude_on_error = true`). The sidecar can fail and Loom keeps working at higher API cost. |
| R3 | **iCloud sync conflicts** producing duplicate inbox files. | Sniffer dedups + writes a conflict resolution log (system design §14). |
| R4 | **Schema drift between Loom Core's polymorphic references and write-time integrity.** SQLite cannot enforce `(entity_type, entity_id)` FKs. | Service layer enforces; integration tests cover; a future `pragma_check` job can reconcile. |
| R5 | **Migration produces poor rewrites at scale.** Two-tier confidence routes low-confidence to triage, but if confidence calibration is wrong, the queue floods or quietly drops good content. | Migration runs in batches. First batch is small, manually verified. Confidence threshold tunable in config. |
| R6 | **Stakeholder bloat.** Every meeting attendee gets imported as a stakeholder; signal:noise collapses. | Resolution queue includes "promote to first-class stakeholder?" prompt rather than auto-promotion (CRO projection §12). |
| R7 | **Engagement granularity drift.** 12+ hypotheses per engagement, system collapses into a task tracker. | Hypothesis count check during arena-level review; explicit consolidation discipline (CRO projection §12). |
| R8 | **External advocate confidence inferences become load-bearing.** "Madhavan is hardening" gets cited in decisions. | Strict enforcement of blueprint principle: confidence is interpretive, never persisted to archive (CRO projection §5). |
| R9 | **Email-based atom extraction is noisy.** Recall-favouring extraction on email produces more noise than transcripts. | Acceptable v1 trade-off; triage absorbs cost. Re-evaluate in v2. |
| R10 | **Single-writer bottleneck under cron load.** Multiple cron jobs converge at 7am brief generation while inbox sweep runs. | One uvicorn worker is intentional. APScheduler serialises in-process. SQLite WAL mode handles concurrent reads. Watch P99 in `loom doctor`. |
| R11 | **Cognition module growth pressure.** If prompt iteration volume is high, the in-process cognition module (W16) may slow API responses or complicate deployment. | v2 extraction path is documented in #092 (blueprint reconciliation). Cost meter (in #080) provides early warning if Claude API spend or latency crosses thresholds; trigger to extract is a measurement, not an opinion. |
| R12 | **Apple FM HTTP API stability dependency.** W16 Tier 3 cognition (and W17 leverage inference reading calendar archive) depend on msgvault-comms exposing FM and calendar over HTTP. If msgvault is not yet shipping this surface, W16 ships with Tier 1 + Tier 4 only and W17 falls back to manual seed for time resources. | Coordinate with msgvault-comms changes; gate W16/#080 Tier 3 work on the HTTP API being stable. Privacy gate (#080) explicitly raises `LocalOnlyUnavailableError` when Tier 3 is needed but unavailable, rather than silently downshifting to cloud. |

---

## 13. Out-of-band questions (parked, not blocking)

These were raised in the design corpus and remain open. They do not block v1 build but warrant explicit decision before/during build:

- **Engagement closure timing** — at SOW completion? Post-implementation review? (CRO projection §13)
- **AWS partner-team modelling** — does AWS get its own arena, or stay as cross-engagement stakeholders only? (CRO projection §13)
- **PBP (Partner Business Plan) status** — notebook artifact, account-level driver, or hybrid? (CRO projection §13)
- **MCP server discovery** — single `loom` server, or per-domain? (Blueprint §16) — **Decision for v1: single `loom` server.**
- **Migration of current state** — what imports at v1, what starts empty? (Blueprint §16) — **Decision for v1: existing work-domain Obsidian vaults import; everything else starts empty.**

---

## 14. References

- `docs/loom-design.md` — concept and rituals
- `docs/loom-blueprint.md` — universal core invariants
- `docs/loom-system-design-v1.md` — architecture, pinned versions, **authoritative**
- `docs/loom-schema-v1.sql` — full DDL
- `docs/loom-api-v1.md` — full HTTP API
- `docs/loom-style-guide.md` — UI / vault rendering
- `docs/projections/cro.md` — work-domain projection (only v1 projection)
- `../../ai-engineer-workshop-2026-project/PROJECT_SETUP_GUIDE.md` — workshop methodology

---

*End of v1 PRD.*
