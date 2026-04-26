# Loom Core API v1

Internal HTTP API exposed by the Loom Core daemon. Consumed by the MCP server (which wraps subsets as MCP tools for Claude) and the SwiftUI Loom UI. Loom Core is the sole writer to the structured store and the Obsidian vault — every other process reaches the data through this API.

---

## Conventions

### Base URL
`http://127.0.0.1:9100/v1`

The daemon binds to `127.0.0.1` only. Port `9100` chosen to avoid common conflicts; configurable via `~/.loom/config.toml`.

### Authentication
None in v1. The daemon is localhost-bound and the threat model is "another local user on the same Mac" — controllable by the user. A shared-secret bearer token is a v2 hardening option (passed as `Authorization: Bearer <token>` from a config file readable only by the user).

### Content type
All requests and responses use `application/json` unless stated otherwise. Brief endpoints additionally support `?format=markdown` for the rendered Obsidian markdown form.

### IDs
All primary identifiers are ULIDs (26-character Crockford base32, time-ordered). Example: `01HW3K7Z8N5P2Q4R6S8T0V2X4`. Sortable lexically, monotonic across machines.

### Dates and timestamps
ISO 8601 with timezone. Example: `2026-04-26T15:30:00+08:00`. The server returns Singapore time when the user's machine is in `Asia/Singapore`; stored in the database as UTC, converted on read.

### Pagination
Cursor-based for all list endpoints.

Request:
```
GET /atoms?limit=50&cursor=<opaque>
```

Response:
```json
{
  "data": [ { ... }, ... ],
  "next_cursor": "01HW...XYZ" | null,
  "total_count_estimate": 1247
}
```

Default `limit` is 50, max 200. `next_cursor` is `null` when the page is the last. `total_count_estimate` is an approximation; exact counts on demand via `?include_count=true` (slower).

### Filtering
Multiple values comma-separated: `?type=commitment,ask`. Time ranges via ISO 8601: `?since=2026-04-01&until=2026-04-26`. Relative ranges: `?since=14d` for last 14 days, `?since=4w` for last 4 weeks.

### Domain scoping
Most endpoints accept `?domain=work` to scope. v1 has only `work`; the parameter is reserved for forward-compatibility. Omitting `domain` defaults to the user's default domain (configurable, currently `work`).

### Errors
Standard HTTP status codes. Body shape:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Hypothesis 01HW3K... not found",
    "details": { "id": "01HW3K..." }
  }
}
```

Codes:
- `VALIDATION_ERROR` (400) — malformed request
- `NOT_FOUND` (404) — entity does not exist
- `CONFLICT` (409) — operation conflicts with current state (e.g., closing already-closed engagement)
- `UNPROCESSABLE_ENTITY` (422) — semantically invalid (e.g., closing a hypothesis with open commitments)
- `INTERNAL_ERROR` (500) — Loom Core fault; logged for diagnosis

### Request IDs
Every response carries an `X-Request-Id` header (ULID). Logged on the server. Include in bug reports.

---

## Endpoints

### Domains

`GET /domains` — list domains. Read-only seeded data; v1 returns `[{ "id": "work", "display_name": "Work / CRO", "privacy_tier": "standard" }]`.

### Arenas

`GET /arenas` — list arenas.
- Query: `?domain=work&closed=false&q=<n>`
- Response: paginated list

`GET /arenas/{id}` — get one arena (with metadata join from `work_account_metadata`).

`POST /arenas` — create an arena.
- Body: `{ "domain": "work", "name": "Panasonic", "description": "...", "metadata": { "industry": "...", "region": "SG", "aws_segment": "...", "customer_type": "enterprise" } }`
- Response: 201 with the created arena.

`PATCH /arenas/{id}` — partial update. Body fields are optional; only those provided are updated. Metadata fields update `work_account_metadata` in the same transaction.

`POST /arenas/{id}/close` — sets `closed_at` to now. 409 if already closed.

### Engagements

`GET /engagements` — list.
- Query: `?domain=work&arena_id=<id>&arena_name=<n>&closed=false&type_tag=delivery_wave`
- The `arena_name` convenience parameter resolves to `arena_id`; helpful for MCP calls that reach the API by name.

`GET /engagements/{id}` — get one (with `work_engagement_metadata` joined).

`POST /engagements`
- Body: `{ "domain": "work", "arena_id": "...", "name": "Wave 2", "type_tag": "delivery_wave", "started_at": "...", "metadata": { "sow_value": 750000, "sow_currency": "SGD", "aws_funded": true, "aws_program": "MAP", "swim_lane": "p2_sales_generated" } }`

`PATCH /engagements/{id}` — partial update.

`POST /engagements/{id}/close` — sets `ended_at` to now. 409 if hypotheses are still open and `?force=false` (default); 200 if `?force=true`, but each open hypothesis returns its current state in the response so the user can see what was force-closed.

### Hypotheses

`GET /hypotheses` — list.
- Query: `?domain=work&arena_id=&engagement_id=&layer=engagement|arena&closed=false&q=<title>`

`GET /hypotheses/{id}` — get one. Returns full record including denormalized current state.

`POST /hypotheses`
- Body: `{ "domain": "work", "arena_id": "...", "engagement_id": "..." | null, "layer": "engagement", "title": "Wave 2 hits cost outcome", "description": "..." }`
- The combination `engagement_id != null && layer == "engagement"` or `engagement_id == null && layer == "arena"` is enforced.

`PATCH /hypotheses/{id}` — title, description.

`POST /hypotheses/{id}/close`
- Body: `{ "terminal_state": "realised|confirmed|dead", "reason": "..." }`
- Writes a state-change row (progress = terminal_state, changed_by = "human_confirmed") and sets `closed_at`.

### Hypothesis state operations

`GET /hypotheses/{id}/state` — current 3-dimensional state.
```json
{
  "progress": "in_delivery",
  "confidence": "medium",
  "momentum": "slowing",
  "progress_last_changed_at": "2026-04-15T...",
  "confidence_last_reviewed_at": "2026-04-22T...",
  "momentum_last_reviewed_at": "2026-04-22T...",
  "confidence_inferred": false,
  "momentum_inferred": true
}
```

`GET /hypotheses/{id}/state/history` — paginated audit log of all state changes.

`GET /hypotheses/{id}/state/proposals` — pending inferred state changes awaiting human review.
- Query: `?dimension=progress|confidence|momentum`
- Response items include the cron-generated `reasoning` and the supporting atom IDs.

`POST /hypotheses/{id}/state/proposals/{proposal_id}/confirm`
- Body: optional `{ "notes": "..." }`
- Effect: writes a state-change row with `changed_by = "human_confirmed"`, mirrors the proposal's `new_value`, updates the denormalized columns on `hypotheses`, marks the related triage item resolved.

`POST /hypotheses/{id}/state/proposals/{proposal_id}/override`
- Body: `{ "dimension": "confidence", "new_value": "high", "override_reason": "Thee Jay's concern was performative for an internal audience" }`
- Effect: writes a state-change row with `changed_by = "human_overridden"`, the user's `new_value`, and the `override_reason` (the highest-value training signal in the system). Marks the proposal resolved.

### Events

`GET /events` — list.
- Query: `?domain=work&type=process,inbox_derived&since=14d&until=...&q=<full-text>`

`GET /events/{id}` — get one. Includes `body_summary`, `source_path`, `source_metadata`, related atoms count.

`GET /events/{id}/atoms` — atoms extracted from this event (paginated).

`POST /events` — create manually (UI-driven captures, e.g., user pastes a quick note).
- Body: `{ "domain": "work", "type": "inbox_derived", "occurred_at": "...", "body_summary": "...", "source_path": "...", "source_metadata": { ... } }`
- Effect: row written; processor's atom-extractor is invoked async; KG generator queues a markdown render.

(No PATCH or DELETE on events — events are immutable per the design.)

### Atoms

`GET /atoms` — list with rich filtering.
- Query:
  - Source: `event_id=`, `artifact_id=`
  - Type: `type=decision,commitment,ask,risk,status_update`
  - Lifecycle: `status=open,in_progress` (commitments/asks), `severity=high,critical` (risks)
  - Triage state: `dismissed=false`, `attached=true` (any hypothesis), `attached_to_hypothesis=<id>`
  - Stakeholders: `owner=<id>` (commitment/ask owner)
  - Time: `since=14d`, `until=...`
  - Domain: `domain=work`
  - Scope (work-specific): `scope_type=engagement`, `scope_id=<id>` — atoms attached to hypotheses under this engagement
  - Sort: `sort=created_desc|sort_key_desc|due_asc`

`GET /atoms/{id}` — get one. Includes type-specific detail (commitment_details, ask_details, risk_details), attachments, external references.

`POST /atoms` — create manually (rare; mostly cron-generated). Body specifies type, source, content, anchor_id (server generates if omitted).

`PATCH /atoms/{id}` — edit content or anchor_id. Use sparingly; events are immutable but atoms can be revised pre-attachment.

`POST /atoms/{id}/dismiss`
- Body: `{ "reason": "duplicate of atom 01HW...", "scope": "global" | "attachment", "attachment_id": "..." }`
- `scope=global` dismisses the atom entirely (sets `atoms.dismissed`).
- `scope=attachment` dismisses only the attachment to a specific hypothesis (sets `atom_attachments.dismissed`).

`POST /atoms/{id}/undismiss` — restore. Body: `{ "scope": "...", "attachment_id"?: "..." }`.

`GET /atoms/{id}/provenance` — returns the source content for the atom.
```json
{
  "atom": { "id": "...", "anchor_id": "d-001", "content": "..." },
  "source_type": "event" | "artifact",
  "source_id": "...",
  "source_path": "/path/to/file.md",
  "source_excerpt": "the actual transcript paragraph or message excerpt where the atom was extracted",
  "source_metadata": { ... }
}
```

### Atom attachments (triage core)

`GET /atoms/{id}/attachments` — list hypotheses this atom is attached to (excludes dismissed by default; `?include_dismissed=true` to include).

`GET /hypotheses/{id}/attachments` — list atoms attached to this hypothesis (with the same filtering).

`POST /atoms/{id}/attach`
- Body: `{ "hypothesis_id": "...", "ambiguity_flag": false, "attached_by": "human_confirmed" }`
- 201 with the new attachment record.
- 409 if attachment already exists (use PATCH to flip ambiguity_flag).

`POST /atoms/{id}/detach`
- Body: `{ "hypothesis_id": "...", "dismissal_reason": "..." }`
- Soft-detaches: sets `atom_attachments.dismissed = true` with reason.

### Atom commitment / ask / risk lifecycle

`PATCH /atoms/{id}/commitment` — update commitment status.
- Body: `{ "current_status": "met" | "slipped" | "renegotiated" | "cancelled", "reason": "..." }`
- Effect: updates `atom_commitment_details`, writes an `atom_status_changes` row.

`PATCH /atoms/{id}/ask` — same for asks.

`PATCH /atoms/{id}/risk`
- Body: `{ "severity"?: "...", "mitigation_status"?: "...", "owner_stakeholder_id"?: "..." }`
- No status_history table for severity/mitigation in v1; only the latest values are kept. (If audit becomes important, atom_status_changes can be repurposed in v2.)

### Stakeholders

`GET /stakeholders` — list / search.
- Query: `?q=<name or email substring>&organization=<...>&limit=`
- Returns matches with confidence scores when search is fuzzy.

`GET /stakeholders/{id}` — full record.

`POST /stakeholders`
- Body: `{ "canonical_name": "Madhavan R.", "primary_email": "madhavan@panasonic.com", "aliases": ["Madhav"], "organization": "Panasonic" }`

`PATCH /stakeholders/{id}` — update fields, including adding aliases.

`POST /stakeholders/{id}/merge`
- Body: `{ "merge_into_id": "<other_stakeholder_id>", "reason": "duplicate created during migration" }`
- Effect: rewrites all FKs (atoms, attachments, work_stakeholder_roles) from `{id}` to `merge_into_id`, then deletes `{id}`. Atomic transaction.

`GET /stakeholders/{id}/atoms` — atoms where this stakeholder is owner (commitment/ask) or referenced.

`GET /stakeholders/{id}/roles?domain=work` — role attachments scoped to a domain.

`POST /stakeholders/{id}/roles`
- Body: `{ "domain": "work", "scope_type": "engagement", "scope_id": "...", "role": "internal_advocate", "effective_from": "..." }`

`DELETE /stakeholders/{id}/roles/{role_id}` — soft (sets `effective_to`) by default; hard delete via `?hard=true`.

### Artifacts (notebooks)

`GET /artifacts` — list.
- Query: `?domain=work&type_tag=research&abandoned=false`

`GET /artifacts/{id}` — current state (the latest version).

`POST /artifacts`
- Body: `{ "domain": "work", "name": "Panasonic-PBP", "type_tag": "decision_record", "initial_content": "...", "initial_authorship": "human" }`
- Creates artifact + first version atomically.

`PATCH /artifacts/{id}` — metadata only (name, type_tag). Content changes are versions.

`GET /artifacts/{id}/versions` — version history (paginated, newest first).

`GET /artifacts/{id}/versions/{version_number}` — specific version content.

`POST /artifacts/{id}/versions`
- Body: `{ "content": "...", "authorship": "claude" | "human" | "collaborative" }`
- Effect: writes new version, increments `version_number`, updates `last_modified_at` and writes content to `versions/v_N.md` in the vault.

`POST /artifacts/{id}/fork`
- Body: `{ "name": "Panasonic-PBP-exec", "parent_version": <number> | null }`
- Creates a child artifact with `parent_artifact_id` set; copies content from `parent_version` (or current if null).

### Briefs

`GET /briefs/engagement/{id}` — engagement-level brief.
- Query parameters for on-demand augmentation:
  - `?since=14d` — atoms since
  - `?focus=stakeholder_confidence|delivery_health|aws_alignment`
  - `?depth=quick|standard|deep`
  - `?format=json|markdown`
- Quick (default) returns the pre-generated baseline. Standard re-renders against any new atoms since baseline. Deep regenerates fully.

Response (json mode) — see the detailed example below.

`GET /briefs/arena/{id}` — arena (account) brief. Aggregates engagements and arena-level hypotheses.

`GET /briefs/runs?scope_type=engagement&scope_id=...&since=...` — historical pre-generation runs.

`POST /briefs/regenerate` (admin)
- Body: `{ "scope_type": "engagement", "scope_id": "..." }`
- Forces re-generation outside the cron schedule.

### Triage

`GET /triage` — unified triage queue.
- Query: `?type=state_change_proposal,low_confidence_atom&scope_type=&scope_id=&resolved=false&priority_min=0.5`

`GET /triage/{id}` — single triage item with full context (the related entity, the proposal, the supporting atoms).

`POST /triage/{id}/resolve`
- Body: `{ "resolution": "confirmed|overridden|dismissed|deferred", "notes": "..." }`
- For state-change proposals, prefer the dedicated `/state/proposals/.../confirm` and `/override` endpoints — they capture richer audit data. This generic endpoint is for items without a dedicated handler.

### Migration

`GET /migration/records`
- Query: `?status=pending_review|all&confidence_tier=low_queued_for_review&limit=`

`GET /migration/records/{id}` — full record including the original archived path, the canonical event/artifact, and side-by-side diff.

`POST /migration/records/{id}/accept` — marks `review_decision = 'accepted'`.

`POST /migration/records/{id}/reject`
- Body: `{ "notes": "..." }`
- Marks `review_decision = 'rejected'`. Does not delete the canonical event/artifact (the user can manually clean up).

`POST /migration/records/{id}/rerun`
- Body: `{ "llm": "claude" | "apple_ai", "force": true }`
- Re-invokes the migration pipeline on the original. Marks `review_decision = 'rerun_pending'` until the re-run completes.

### External references

`GET /external-references` — list.
- Query: `?ref_type=url&unreachable=true`

`GET /external-references/{id}` — full record including `summary_md_path` and `last_verified_at`.

`POST /external-references`
- Body: `{ "ref_type": "url", "ref_value": "https://...", "summary_md_path": "outbox/work/external/{id}.md" }`
- 200 if already exists (idempotent).

`PATCH /external-references/{id}` — update verification status (`unreachable`, `last_verified_at`).

### Search

`GET /search`
- Query: `?q=<full-text>&types=atom,event,hypothesis&domain=work&since=&limit=20`
- Returns ranked results with type-specific snippets.
- v1 uses SQLite FTS5 over atom content, event body_summary, and artifact current versions. Embedding-based semantic search is a v2 hardening.

### Health

`GET /health` — basic status: `{ "status": "ok", "version": "1.0.0", "db_size_bytes": ..., "uptime_seconds": ... }`.

`GET /health/processor` — last cron run per pipeline.
```json
{
  "pipelines": {
    "inbox_sweep": { "last_run_at": "...", "success": true, "items_processed": 12 },
    "state_inference": { ... },
    "kg_render": { ... },
    "brief_generation": { ... }
  }
}
```

---

## Detailed examples

### Example 1: Engagement brief (read)

`GET /v1/briefs/engagement/01HW3K7Z8N5P2Q4R6S8T0V2X4?focus=delivery_health&depth=standard`

Response (truncated for clarity):
```json
{
  "engagement": {
    "id": "01HW3K7Z8N5P2Q4R6S8T0V2X4",
    "name": "Wave 2",
    "type_tag": "delivery_wave",
    "arena": { "id": "01HW1A...", "name": "Panasonic" },
    "started_at": "2026-01-15T00:00:00+08:00",
    "metadata": {
      "sow_value": 750000,
      "sow_currency": "SGD",
      "aws_funded": true,
      "aws_program": "MAP",
      "swim_lane": "p2_sales_generated"
    }
  },
  "hypotheses": [
    {
      "id": "01HW2B...",
      "title": "Wave 2 hits cost outcome",
      "layer": "engagement",
      "state": {
        "progress": "in_delivery",
        "confidence": "medium",
        "momentum": "slowing",
        "progress_last_changed_at": "2026-04-15T...",
        "confidence_last_reviewed_at": "2026-04-22T...",
        "confidence_inferred": false,
        "momentum_inferred": true
      },
      "recent_atom_count": 7,
      "open_commitment_count": 3,
      "pending_review_count": 1
    }
  ],
  "recent_atoms": [
    {
      "id": "01HW4C...",
      "type": "commitment",
      "content": "Madhavan to socialise the budget with the steering committee by Apr 26.",
      "anchor_id": "c-014",
      "created_at": "2026-04-19T...",
      "commitment": {
        "owner_stakeholder_id": "01HW0X...",
        "owner_name": "Madhavan R.",
        "due_date": "2026-04-26",
        "current_status": "open"
      },
      "attached_hypotheses": [
        { "id": "01HW2B...", "title": "Wave 2 hits cost outcome" }
      ]
    }
  ],
  "pending_reviews": {
    "state_changes": 1,
    "low_confidence_atoms": 5,
    "ambiguous_routing": 0
  },
  "executive_narrative": "Wave 2 is in delivery with timeline holding...",
  "generated_at": "2026-04-26T07:00:00+08:00",
  "augmented_at": "2026-04-26T08:42:13+08:00",
  "depth": "standard",
  "focus": "delivery_health"
}
```

### Example 2: Triage attach (write)

`POST /v1/atoms/01HW4C.../attach`

Request:
```json
{
  "hypothesis_id": "01HW2B...",
  "ambiguity_flag": false,
  "attached_by": "human_confirmed"
}
```

Response (201):
```json
{
  "id": "01HW5D...",
  "atom_id": "01HW4C...",
  "hypothesis_id": "01HW2B...",
  "attached_at": "2026-04-26T16:20:11+08:00",
  "attached_by": "human_confirmed",
  "ambiguity_flag": false,
  "dismissed": false
}
```

Server-side effects: row inserted into `atom_attachments`; KG generator re-renders the hypothesis page (the atom's wikilink appears under "## Attached atoms"); the source event page is re-rendered to show the attachment indicator next to the atom anchor.

### Example 3: State-change override (write)

`POST /v1/hypotheses/01HW2B.../state/proposals/01HW6E.../override`

Request:
```json
{
  "dimension": "confidence",
  "new_value": "high",
  "override_reason": "The slipped commitments are admin friction, not customer alignment risk. Steering committee chair confirmed continued sponsorship in 1:1 last week."
}
```

Response (200):
```json
{
  "state_change_id": "01HW7F...",
  "hypothesis_id": "01HW2B...",
  "dimension": "confidence",
  "old_value": "medium",
  "new_value": "high",
  "changed_at": "2026-04-26T16:25:43+08:00",
  "changed_by": "human_overridden",
  "override_reason": "...",
  "supporting_atoms": [],
  "proposal_resolved": true
}
```

The override reason is stored verbatim. It feeds the inference model improvement loop, becoming the highest-value training signal in the system.

### Example 4: Atom provenance (read)

`GET /v1/atoms/01HW4C.../provenance`

Response:
```json
{
  "atom": {
    "id": "01HW4C...",
    "type": "commitment",
    "anchor_id": "c-014",
    "content": "Madhavan to socialise the budget with the steering committee by Apr 26."
  },
  "source_type": "event",
  "source_id": "01HW8G...",
  "source_event": {
    "id": "01HW8G...",
    "type": "process",
    "occurred_at": "2026-04-19T14:00:00+08:00",
    "source_path": "inbox/work/teams/2026-04-19_panasonic-steerco.md",
    "source_metadata": {
      "calendar_event_id": "...",
      "attendees": ["Madhavan R.", "Thee Jay", "Phani Battula"]
    }
  },
  "source_excerpt": "Madhavan: I can take the budget conversation. Let me socialise it with the steerco — give me until next Thursday, the 26th. ...",
  "source_excerpt_offset_chars": 4231,
  "rendered_in_vault": "outbox/work/events/2026-04-19_panasonic-steerco.md#^c-014"
}
```

The `source_excerpt` is the actual transcript paragraph, not a paraphrase. The `rendered_in_vault` path is the wikilink target — clicking it in Obsidian jumps to the anchor.

---

## MCP tool mapping

The MCP server is a thin wrapper. Each MCP tool resolves names to IDs (when needed) and calls one or two HTTP endpoints.

| MCP tool | HTTP calls |
|---|---|
| `get_engagement_brief(domain, name)` | `GET /engagements?name=` then `GET /briefs/engagement/{id}` |
| `get_arena_brief(domain, name)` | `GET /arenas?name=` then `GET /briefs/arena/{id}` |
| `get_open_commitments(domain, scope, owner, days)` | `GET /atoms?type=commitment&status=open,in_progress&scope_type=&scope_id=&owner=&since={days}d` |
| `get_recent_decisions(domain, scope, days)` | `GET /atoms?type=decision&scope_type=&scope_id=&since={days}d` |
| `get_open_asks(domain, scope, side)` | `GET /atoms?type=ask&status=raised,acknowledged,in_progress&scope_type=&scope_id=&work_ask_side=` |
| `get_risk_register(domain, scope)` | `GET /atoms?type=risk&scope_type=&scope_id=&dismissed=false` |
| `get_pending_reviews(domain, scope)` | `GET /triage?scope_type=&scope_id=&resolved=false` |
| `get_atom_provenance(atom_id)` | `GET /atoms/{atom_id}/provenance` |
| `get_notebook(name, version)` | `GET /artifacts?name=` then `GET /artifacts/{id}/versions/{version}` (or `/artifacts/{id}` for current) |
| `write_to_notebook(name, content, version_intent)` | `GET /artifacts?name=` then `POST /artifacts/{id}/versions` |

All MCP tools accept a `domain` parameter; the wrapper passes through to the API.

---

## UI flow examples

### Friday triage ritual (4–5pm calendar block)

1. User opens the Loom UI app.
2. UI: `GET /triage?resolved=false&scope_type=engagement` — fetch all unresolved triage items grouped by engagement.
3. UI displays the queue, sorted by priority. State-change proposals first, then atom triage, then ambiguous routings.
4. User clicks a state-change proposal:
   - UI: `GET /hypotheses/{id}/state/proposals` — fetch full proposal with reasoning and supporting atoms.
   - UI shows the proposal, the cron-generated reasoning, and the atom evidence.
5. User clicks Confirm:
   - UI: `POST /hypotheses/{id}/state/proposals/{proposal_id}/confirm` — write state change, mark proposal resolved.
   - UI optimistically removes the item from the queue, refreshes from `GET /triage`.
6. User clicks Override on the next:
   - UI shows a form with the proposal's `new_value`, an alternative dropdown, and a required `override_reason` text field.
   - On submit, `POST /hypotheses/{id}/state/proposals/{proposal_id}/override`.
7. For atom triage items, UI fetches `GET /atoms/{id}` and `GET /hypotheses?engagement_id={current_engagement_id}` to populate the attach picker.
   - User picks a hypothesis: `POST /atoms/{id}/attach`.
   - User dismisses with reason: `POST /atoms/{id}/dismiss`.

### Sunday account review (last Sunday evening)

1. User opens Loom UI, navigates to the Panasonic arena page.
2. UI: `GET /arenas/{id}` for arena metadata, then `GET /briefs/arena/{id}` for the brief.
3. UI shows arena-level hypotheses, all engagement summaries, cross-engagement patterns.
4. User reviews arena-level hypothesis state, confirms or overrides via the same `/state/proposals/.../confirm|override` endpoints.
5. User can drill into any engagement: `GET /briefs/engagement/{id}` opens the standard engagement brief.

### Migration review

1. User opens UI's Migration tab.
2. UI: `GET /migration/records?status=pending_review&limit=20` — first batch.
3. For each record, UI shows side-by-side diff (original markdown vs canonical rewrite).
4. User clicks Accept: `POST /migration/records/{id}/accept`.
5. User clicks Reject with note: `POST /migration/records/{id}/reject`.
6. User clicks Rerun (e.g., model improved): `POST /migration/records/{id}/rerun` with `llm: "claude"`.

### Claude-mediated brief (no UI involved)

1. User asks Claude in claude.ai or Claude Desktop: "Brief me on Panasonic Wave 2 for the 10am."
2. Claude invokes `get_engagement_brief("work", "Panasonic Wave 2")` MCP tool.
3. MCP server: `GET /engagements?domain=work&name=Panasonic+Wave+2` resolves the name.
4. MCP server: `GET /briefs/engagement/{id}?depth=standard&focus=delivery_health` (or whichever angle the user implied).
5. Brief returned to Claude as JSON. Claude composes the conversational response, possibly chaining `get_atom_provenance` for any specific claim the user pushes back on.

---

## Real-time considerations

v1 is polling-only. The Loom UI polls `GET /triage` every 30 seconds while the user is in the triage view; otherwise it polls on user action. This is sufficient for cron-driven workflows where freshness measures in minutes.

v2 will add SSE: `GET /events/stream?topics=triage,brief_runs,migration` returns `text/event-stream` with newline-delimited JSON events. The MCP server does not subscribe (Claude calls are stateless); only the UI does.

---

## Versioning

URL-prefixed: `/v1/...`. Breaking changes go to `/v2`. Both can run in parallel during migration. Backward-compatible additions (new fields, new endpoints) ship in `/v1` without a version bump.

The schema version is independent: `PRAGMA user_version` in SQLite tracks DDL revisions, applied via small migration scripts in Loom Core's startup.

---

## Out of scope for v1

The following are deliberately deferred:
- **Authentication and authorisation.** Single-user, localhost-bound.
- **Multi-tenancy.** Single user, single Mac.
- **Webhooks for outbound integrations.** No external systems consume Loom in v1.
- **Bulk operations endpoints.** No `POST /atoms/bulk` etc. — the SwiftUI UI handles batching client-side.
- **Soft-delete recovery endpoints.** Dismissals are reversible via `/atoms/{id}/undismiss`; deletions of higher-level entities (engagements, arenas) are not yet exposed because v1 has no use case.
- **Embedding-based semantic search.** v1 search is FTS5 only.
- **Real-time SSE.** Polling is good enough.

---

*End of v1 spec.*
