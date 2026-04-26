-- ============================================================================
-- Loom v1 schema
-- ----------------------------------------------------------------------------
-- Target: SQLite 3.38+ (for partial indexes and JSON1)
-- Scope:  v1 ships Work domain only, but the schema is structured so other
--         domains (finance, content, code, health, personal) drop in by
--         adding their own projection-layer tables alongside the universal
--         core. No core table changes required.
-- Writer: Loom Core (Python daemon) is the sole writer. The MCP server and
--         SwiftUI app are read-only clients of Loom Core's HTTP API; they
--         never open this database directly.
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;       -- better concurrent reads while Loom Core writes
PRAGMA synchronous = NORMAL;     -- WAL is safe with NORMAL; full durability only on checkpoint
PRAGMA temp_store = MEMORY;
PRAGMA cache_size = -20000;      -- 20MB cache

-- ============================================================================
-- SECTION 1: Universal core
-- ----------------------------------------------------------------------------
-- These tables are domain-agnostic. Every entity carries a `domain` column;
-- queries scope by domain to enforce privacy at the query layer.
-- ============================================================================

-- Domains: first-class scope on every entity.
CREATE TABLE domains (
  id              TEXT PRIMARY KEY,
  display_name    TEXT NOT NULL,
  privacy_tier    TEXT NOT NULL CHECK (privacy_tier IN ('standard', 'sensitive')),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed v1 domain.
INSERT INTO domains (id, display_name, privacy_tier) VALUES
  ('work', 'Work / CRO', 'standard');

-- ----------------------------------------------------------------------------
-- Spine: arenas → engagements → hypotheses
-- ----------------------------------------------------------------------------

-- Arenas: a logical grouping within a domain.
-- Work: account. Finance: goal. Content: pillar. Code: project. (Work-only in v1.)
CREATE TABLE arenas (
  id              TEXT PRIMARY KEY,
  domain          TEXT NOT NULL REFERENCES domains(id),
  name            TEXT NOT NULL,
  description     TEXT,
  closed_at       TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_arenas_domain ON arenas(domain, closed_at);

-- Engagements: bounded effort within an arena.
-- Work: delivery wave, project, ongoing support.
CREATE TABLE engagements (
  id              TEXT PRIMARY KEY,
  domain          TEXT NOT NULL REFERENCES domains(id),
  arena_id        TEXT NOT NULL REFERENCES arenas(id),
  name            TEXT NOT NULL,
  type_tag        TEXT,                 -- 'delivery_wave', 'project', 'support', etc.
  started_at      TIMESTAMP,
  ended_at        TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_engagements_arena ON engagements(arena_id, ended_at);
CREATE INDEX idx_engagements_domain ON engagements(domain, ended_at);

-- Hypotheses: the value-anchored bets. Two layers.
-- Engagement-level: arena_id and engagement_id both set, layer = 'engagement'.
-- Arena-level:      arena_id set, engagement_id NULL,    layer = 'arena'.
--
-- Current state is denormalized here for fast brief queries.
-- The audit trail lives in hypothesis_state_changes; the denormalized
-- columns must always reflect the latest change_at for each dimension.
CREATE TABLE hypotheses (
  id                              TEXT PRIMARY KEY,
  domain                          TEXT NOT NULL REFERENCES domains(id),
  arena_id                        TEXT NOT NULL REFERENCES arenas(id),
  engagement_id                   TEXT REFERENCES engagements(id),
  layer                           TEXT NOT NULL CHECK (layer IN ('arena', 'engagement')),
  title                           TEXT NOT NULL,
  description                     TEXT,
  -- Three-dimensional state (current snapshot)
  current_progress                TEXT NOT NULL DEFAULT 'proposed'
    CHECK (current_progress IN ('proposed', 'in_delivery', 'realised', 'confirmed', 'dead')),
  current_confidence              TEXT NOT NULL DEFAULT 'medium'
    CHECK (current_confidence IN ('low', 'medium', 'high')),
  current_momentum                TEXT NOT NULL DEFAULT 'steady'
    CHECK (current_momentum IN ('accelerating', 'steady', 'slowing', 'stalled')),
  -- Per-dimension review timestamps (staleness signal in the brief surface)
  progress_last_changed_at        TIMESTAMP,
  confidence_last_reviewed_at     TIMESTAMP,
  momentum_last_reviewed_at       TIMESTAMP,
  -- Inferred-vs-confirmed flag per dimension. Progress is always evidence-sovereign;
  -- confidence and momentum can be inferred-but-unreviewed (rendered visibly distinct).
  confidence_inferred             BOOLEAN NOT NULL DEFAULT 1,
  momentum_inferred               BOOLEAN NOT NULL DEFAULT 1,
  created_at                      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at                       TIMESTAMP,           -- when reaches terminal progress state
  CHECK (
    (layer = 'arena' AND engagement_id IS NULL) OR
    (layer = 'engagement' AND engagement_id IS NOT NULL)
  )
);
CREATE INDEX idx_hypotheses_arena ON hypotheses(arena_id, layer, closed_at);
CREATE INDEX idx_hypotheses_engagement ON hypotheses(engagement_id, closed_at);
CREATE INDEX idx_hypotheses_domain ON hypotheses(domain, layer);

-- Hypothesis state changes: immutable audit log.
-- One row per dimension change. The latest row per (hypothesis_id, dimension)
-- is the source of truth; the denormalized columns on hypotheses cache it.
CREATE TABLE hypothesis_state_changes (
  id              TEXT PRIMARY KEY,
  hypothesis_id   TEXT NOT NULL REFERENCES hypotheses(id),
  dimension       TEXT NOT NULL CHECK (dimension IN ('progress', 'confidence', 'momentum')),
  old_value       TEXT,
  new_value       TEXT NOT NULL,
  changed_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by      TEXT NOT NULL CHECK (changed_by IN ('cron_inferred', 'human_confirmed', 'human_overridden')),
  reasoning       TEXT,                  -- LLM reasoning when cron_inferred, esp. for confidence/momentum
  override_reason TEXT                   -- the user's "why" when overriding an inference (highest-value training signal)
);
CREATE INDEX idx_hsc_hypothesis ON hypothesis_state_changes(hypothesis_id, dimension, changed_at DESC);

-- State-change evidence: many-to-many between state changes and the atoms that triggered them.
-- The provenance from a state transition back to the source atoms.
CREATE TABLE state_change_evidence (
  state_change_id TEXT NOT NULL REFERENCES hypothesis_state_changes(id),
  atom_id         TEXT NOT NULL,         -- atoms FK added below; forward declaration
  PRIMARY KEY (state_change_id, atom_id)
);

-- ----------------------------------------------------------------------------
-- Stakeholders: global entities. Identity is global; roles are scoped per domain.
-- ----------------------------------------------------------------------------
CREATE TABLE stakeholders (
  id              TEXT PRIMARY KEY,
  canonical_name  TEXT NOT NULL,
  primary_email   TEXT UNIQUE,
  aliases         JSON,                  -- ["Madhav", "Madhavan R"] for fuzzy matching
  organization    TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_stakeholders_name ON stakeholders(canonical_name COLLATE NOCASE);
CREATE INDEX idx_stakeholders_email ON stakeholders(primary_email);

-- ----------------------------------------------------------------------------
-- Events: immutable journal. Once written, never edited.
-- ----------------------------------------------------------------------------
CREATE TABLE events (
  id              TEXT PRIMARY KEY,
  domain          TEXT NOT NULL REFERENCES domains(id),
  type            TEXT NOT NULL CHECK (type IN (
    'process',            -- meetings, dictation sessions, recorded sessions
    'inbox_derived',      -- typed quick notes, forwarded excerpts
    'state_change',       -- hypothesis state transitions (themselves first-class events)
    'research',           -- Claude-authored research artifacts
    'publication',        -- something reaches the world
    'external_reference'  -- pointer to external state (URL, message-id, commit)
  )),
  occurred_at     TIMESTAMP NOT NULL,    -- when the event happened in the world
  source_path     TEXT,                  -- filesystem path to the source artifact
  source_metadata JSON,                  -- attendees, sender/recipients, calendar event ID, etc.
  body_summary    TEXT,                  -- compressed markdown summary; full body lives at source_path
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_events_domain ON events(domain, occurred_at DESC);
CREATE INDEX idx_events_type ON events(type, occurred_at DESC);

-- ----------------------------------------------------------------------------
-- Atoms: extracted facts. The substrate.
-- ----------------------------------------------------------------------------
-- Every atom has a source: either an event (the journal) or an artifact
-- (a notebook). At least one of event_id / artifact_id is non-null.
--
-- Atoms carry visible block anchors (^d-001 etc.) into the rendered Obsidian
-- event page. Wikilinks from hypothesis pages resolve to event_id#anchor_id.
CREATE TABLE atoms (
  id                      TEXT PRIMARY KEY,
  domain                  TEXT NOT NULL REFERENCES domains(id),
  type                    TEXT NOT NULL CHECK (type IN (
    'decision', 'commitment', 'ask', 'risk', 'status_update'
  )),
  event_id                TEXT REFERENCES events(id),
  artifact_id             TEXT,                  -- artifacts FK below
  content                 TEXT NOT NULL,
  anchor_id               TEXT NOT NULL,         -- e.g., 'd-001' (visible in rendered page)
  confidence_sort_key     REAL DEFAULT 0.5
    CHECK (confidence_sort_key BETWEEN 0 AND 1), -- triage prioritization, NOT extraction gating
  -- Dismissal as first-class data (recall-favoring extraction needs this).
  dismissed               BOOLEAN NOT NULL DEFAULT 0,
  dismissed_at            TIMESTAMP,
  dismissal_reason        TEXT,                  -- the user's "why" — high-value training signal
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (event_id IS NOT NULL OR artifact_id IS NOT NULL)
);
CREATE INDEX idx_atoms_event ON atoms(event_id);
CREATE INDEX idx_atoms_artifact ON atoms(artifact_id);
CREATE INDEX idx_atoms_type ON atoms(domain, type, dismissed, created_at DESC);
CREATE INDEX idx_atoms_dismissed ON atoms(dismissed, created_at DESC);

-- Anchor uniqueness: anchor_id is unique within its parent (event or artifact),
-- not globally. Partial unique indexes enforce both cases.
CREATE UNIQUE INDEX idx_atoms_anchor_event
  ON atoms(event_id, anchor_id) WHERE event_id IS NOT NULL;
CREATE UNIQUE INDEX idx_atoms_anchor_artifact
  ON atoms(artifact_id, anchor_id) WHERE artifact_id IS NOT NULL;

-- Forward-declared FK from state_change_evidence completed here.
-- (SQLite doesn't enforce FKs declared after table creation, but the column is in place.)

-- ----------------------------------------------------------------------------
-- Atom type-specific detail tables
-- ----------------------------------------------------------------------------
-- Decisions and status_updates carry no extra fields; their content alone is sufficient.
-- Commitments, asks, and risks have lifecycle and need detail tables.
-- Each detail row is 1:1 with its atom (atom_id is PK).

CREATE TABLE atom_commitment_details (
  atom_id                     TEXT PRIMARY KEY REFERENCES atoms(id),
  owner_stakeholder_id        TEXT REFERENCES stakeholders(id),
  due_date                    DATE,
  current_status              TEXT NOT NULL DEFAULT 'open' CHECK (current_status IN (
    'open', 'in_progress', 'met', 'slipped', 'renegotiated', 'cancelled'
  )),
  status_last_changed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_commit_owner ON atom_commitment_details(owner_stakeholder_id, current_status);
CREATE INDEX idx_commit_status ON atom_commitment_details(current_status, due_date);
CREATE INDEX idx_commit_due ON atom_commitment_details(due_date) WHERE current_status NOT IN ('met', 'cancelled');

CREATE TABLE atom_ask_details (
  atom_id                     TEXT PRIMARY KEY REFERENCES atoms(id),
  -- The owner of an ask is the party who owes the answer/action — inverted vs commitment.
  owner_stakeholder_id        TEXT REFERENCES stakeholders(id),
  due_date                    DATE,
  current_status              TEXT NOT NULL DEFAULT 'raised' CHECK (current_status IN (
    'raised', 'acknowledged', 'in_progress', 'granted', 'declined'
  )),
  status_last_changed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ask_owner ON atom_ask_details(owner_stakeholder_id, current_status);
CREATE INDEX idx_ask_status ON atom_ask_details(current_status);

CREATE TABLE atom_risk_details (
  atom_id                     TEXT PRIMARY KEY REFERENCES atoms(id),
  severity                    TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  owner_stakeholder_id        TEXT REFERENCES stakeholders(id),
  mitigation_status           TEXT NOT NULL DEFAULT 'unmitigated' CHECK (mitigation_status IN (
    'unmitigated', 'mitigation_in_progress', 'mitigated', 'accepted'
  ))
);
CREATE INDEX idx_risk_severity ON atom_risk_details(severity, mitigation_status);

-- Atom status change history (for commitments, asks, risks).
-- One row per status transition; latest reflects current_status on the detail tables.
CREATE TABLE atom_status_changes (
  id              TEXT PRIMARY KEY,
  atom_id         TEXT NOT NULL REFERENCES atoms(id),
  old_status      TEXT,
  new_status      TEXT NOT NULL,
  changed_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by      TEXT NOT NULL,         -- 'cron' or stakeholder_id
  reason          TEXT
);
CREATE INDEX idx_atom_status_atom ON atom_status_changes(atom_id, changed_at DESC);

-- ----------------------------------------------------------------------------
-- Atom attachments: the triage decision.
-- An atom can attach to multiple hypotheses. Dismissals retained as training signal.
-- ----------------------------------------------------------------------------
CREATE TABLE atom_attachments (
  id                  TEXT PRIMARY KEY,
  atom_id             TEXT NOT NULL REFERENCES atoms(id),
  hypothesis_id       TEXT NOT NULL REFERENCES hypotheses(id),
  attached_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attached_by         TEXT NOT NULL CHECK (attached_by IN ('cron_suggested', 'human_confirmed')),
  ambiguity_flag      BOOLEAN NOT NULL DEFAULT 0,
  dismissed           BOOLEAN NOT NULL DEFAULT 0,
  dismissed_at        TIMESTAMP,
  dismissal_reason    TEXT,
  UNIQUE (atom_id, hypothesis_id)
);
CREATE INDEX idx_attach_hypothesis ON atom_attachments(hypothesis_id, dismissed, attached_at DESC);
CREATE INDEX idx_attach_atom ON atom_attachments(atom_id, dismissed);

-- ----------------------------------------------------------------------------
-- Artifacts: mutable, versioned workspaces (notebooks).
-- ----------------------------------------------------------------------------
CREATE TABLE artifacts (
  id                      TEXT PRIMARY KEY,
  domain                  TEXT NOT NULL REFERENCES domains(id),
  name                    TEXT NOT NULL,
  type_tag                TEXT,                  -- 'research' | 'brainstorm' | 'draft' | 'decision_record'
  parent_artifact_id      TEXT REFERENCES artifacts(id),  -- for forks
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_modified_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  abandoned_at            TIMESTAMP              -- 90-day untouched sunset trigger
);
CREATE INDEX idx_artifacts_domain ON artifacts(domain, last_modified_at DESC);

CREATE TABLE artifact_versions (
  id                  TEXT PRIMARY KEY,
  artifact_id         TEXT NOT NULL REFERENCES artifacts(id),
  version_number      INTEGER NOT NULL,
  content_path        TEXT NOT NULL,             -- filesystem path to versions/v_N.md
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  authorship          TEXT CHECK (authorship IN ('human', 'claude', 'collaborative')),
  UNIQUE (artifact_id, version_number)
);
CREATE INDEX idx_av_artifact ON artifact_versions(artifact_id, version_number DESC);

-- ----------------------------------------------------------------------------
-- External references: live link plus snapshot summary.
-- The summary itself lives as markdown in Obsidian (summary_md_path);
-- the row here is the index entry plus the live pointer.
-- ----------------------------------------------------------------------------
CREATE TABLE external_references (
  id                  TEXT PRIMARY KEY,
  ref_type            TEXT NOT NULL CHECK (ref_type IN (
    'url', 'email_msgid', 'git_commit', 'sharepoint', 'gdrive'
  )),
  ref_value           TEXT NOT NULL,             -- URL, message-id, commit hash
  summary_md_path     TEXT,                      -- path to compressed summary in vault
  captured_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_verified_at    TIMESTAMP,
  unreachable         BOOLEAN NOT NULL DEFAULT 0,
  UNIQUE (ref_type, ref_value)
);
CREATE INDEX idx_extref_unreachable ON external_references(unreachable, last_verified_at);

-- Atoms can cite external references (many-to-many).
CREATE TABLE atom_external_refs (
  atom_id             TEXT NOT NULL REFERENCES atoms(id),
  external_ref_id     TEXT NOT NULL REFERENCES external_references(id),
  PRIMARY KEY (atom_id, external_ref_id)
);

-- ============================================================================
-- SECTION 2: Knowledge graph mirror
-- ----------------------------------------------------------------------------
-- Every DB write fans out to a markdown page in the Obsidian vault.
-- This section tracks which pages exist and the tag overlay across entities.
-- ============================================================================

-- Entity pages: one row per addressable entity that gets a vault page.
-- Atoms do NOT get their own pages — they live as anchored sections inside
-- their parent event/artifact page.
CREATE TABLE entity_pages (
  entity_type         TEXT NOT NULL CHECK (entity_type IN (
    'event', 'hypothesis', 'stakeholder', 'artifact', 'arena', 'engagement'
  )),
  entity_id           TEXT NOT NULL,
  page_path           TEXT NOT NULL,             -- relative path in outbox/{domain}/...
  last_rendered_at    TIMESTAMP,
  render_version      INTEGER NOT NULL DEFAULT 1, -- bump when render template changes
  PRIMARY KEY (entity_type, entity_id)
);
CREATE UNIQUE INDEX idx_pages_path ON entity_pages(page_path);

-- Tags: shared name namespace. Domain-scoped or universal.
CREATE TABLE tags (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  domain          TEXT REFERENCES domains(id),    -- NULL = cross-domain
  description     TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tags_name ON tags(name);

-- Entity tags: polymorphic many-to-many.
-- Loose referential integrity by design — entity_id refers to whichever table
-- entity_type names. Loom Core enforces consistency at write time.
CREATE TABLE entity_tags (
  entity_type     TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  tag_id          TEXT NOT NULL REFERENCES tags(id),
  applied_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  applied_by      TEXT,                          -- 'cron' | 'human' | 'llm'
  PRIMARY KEY (entity_type, entity_id, tag_id)
);
CREATE INDEX idx_etags_tag ON entity_tags(tag_id);
CREATE INDEX idx_etags_entity ON entity_tags(entity_type, entity_id);

-- ============================================================================
-- SECTION 3: Migration tracking
-- ----------------------------------------------------------------------------
-- Two-tier confidence migration: every old note rewritten, original archived,
-- canonical product linked back. High-confidence rewrites auto-roll into the
-- new vault; low-confidence ones queue for Sunday review.
-- ============================================================================

CREATE TABLE migration_records (
  id                      TEXT PRIMARY KEY,
  original_path           TEXT NOT NULL UNIQUE,  -- absolute path in source vault
  archived_path           TEXT NOT NULL,         -- path in new vault: archive/originals/...
  canonical_event_id      TEXT REFERENCES events(id),
  canonical_artifact_id   TEXT REFERENCES artifacts(id),
  confidence_score        REAL CHECK (confidence_score BETWEEN 0 AND 1),
  confidence_tier         TEXT NOT NULL CHECK (confidence_tier IN (
    'high_auto_accepted', 'low_queued_for_review'
  )),
  llm_used                TEXT CHECK (llm_used IN ('claude', 'apple_ai', 'both')),
  migrated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at             TIMESTAMP,
  review_decision         TEXT CHECK (review_decision IN ('accepted', 'rerun_pending', 'rejected')),
  review_notes            TEXT,
  CHECK (canonical_event_id IS NOT NULL OR canonical_artifact_id IS NOT NULL)
);
CREATE INDEX idx_migration_tier ON migration_records(confidence_tier, reviewed_at);
CREATE INDEX idx_migration_pending ON migration_records(reviewed_at) WHERE reviewed_at IS NULL;

-- ============================================================================
-- SECTION 4: Work projection
-- ----------------------------------------------------------------------------
-- Work-domain-specific tables. Other projections add their own prefixed tables
-- (finance_*, content_*, code_*) without touching the universal core.
-- ============================================================================

-- Work-domain account metadata (extends arenas).
CREATE TABLE work_account_metadata (
  arena_id            TEXT PRIMARY KEY REFERENCES arenas(id),
  industry            TEXT,
  region              TEXT,                      -- 'SG', 'PH', 'MY', 'ID', 'TH', 'VN'
  aws_segment         TEXT,                      -- AWS segment classification
  customer_type       TEXT                       -- 'enterprise', 'midmarket', 'startup'
);

-- Work-domain engagement metadata (extends engagements).
CREATE TABLE work_engagement_metadata (
  engagement_id       TEXT PRIMARY KEY REFERENCES engagements(id),
  sow_value           REAL,
  sow_currency        TEXT,
  aws_funded          BOOLEAN NOT NULL DEFAULT 0,
  aws_program         TEXT,                      -- 'MAP', 'PBP', 'POA', etc.
  swim_lane           TEXT CHECK (swim_lane IN (
    'p1_existing_customer', 'p2_sales_generated', 'p3_demand_gen_sdr', 'p4_aws_referral'
  ))
);

-- Work-domain stakeholder roles. Roles are scoped per domain, hence per-projection table.
-- A stakeholder can hold roles at hypothesis, engagement, or arena scope.
CREATE TABLE work_stakeholder_roles (
  id                  TEXT PRIMARY KEY,
  stakeholder_id      TEXT NOT NULL REFERENCES stakeholders(id),
  scope_type          TEXT NOT NULL CHECK (scope_type IN ('hypothesis', 'engagement', 'arena')),
  scope_id            TEXT NOT NULL,             -- polymorphic FK
  role                TEXT NOT NULL CHECK (role IN (
    'sponsor', 'beneficiary', 'blocker', 'validator',
    'advocate', 'doer', 'influencer', 'advisor',
    'decision_maker', 'informed_party', 'internal_advocate'
  )),
  effective_from      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  effective_to        TIMESTAMP
);
CREATE INDEX idx_wsr_stakeholder ON work_stakeholder_roles(stakeholder_id, effective_to);
CREATE INDEX idx_wsr_scope ON work_stakeholder_roles(scope_type, scope_id, effective_to);

-- Work-domain commitment direction (the actor topology specific to CRO motion).
CREATE TABLE work_commitment_direction (
  atom_id             TEXT PRIMARY KEY REFERENCES atoms(id),
  direction           TEXT NOT NULL CHECK (direction IN (
    '1ch_to_customer', 'customer_to_1ch',
    '1ch_to_aws',      'aws_to_1ch',
    'customer_to_aws', 'aws_to_customer',
    '1ch_internal'
  ))
);
CREATE INDEX idx_wcd_direction ON work_commitment_direction(direction);

-- Work-domain ask side.
CREATE TABLE work_ask_side (
  atom_id             TEXT PRIMARY KEY REFERENCES atoms(id),
  side                TEXT NOT NULL CHECK (side IN (
    'asks_of_aws', 'asks_of_customer', 'asks_of_1cloudhub'
  ))
);
CREATE INDEX idx_was_side ON work_ask_side(side);

-- ============================================================================
-- SECTION 5: Operational tracking
-- ----------------------------------------------------------------------------
-- Triage queue, brief generation log, processor run log.
-- ============================================================================

-- Triage items: anything awaiting human review. The Friday 4–5pm queue.
CREATE TABLE triage_items (
  id                      TEXT PRIMARY KEY,
  item_type               TEXT NOT NULL CHECK (item_type IN (
    'state_change_proposal',     -- inferred hypothesis state change awaiting confirmation
    'low_confidence_atom',       -- atom whose extraction is uncertain
    'ambiguous_routing',         -- inbox sniffer couldn't confidently route
    'migration_review',          -- low-confidence migration rewrite
    'stakeholder_resolution'     -- entity-resolution couldn't auto-match
  )),
  related_entity_type     TEXT NOT NULL,
  related_entity_id       TEXT NOT NULL,
  surfaced_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at             TIMESTAMP,
  resolution              TEXT,                  -- 'confirmed', 'overridden', 'dismissed', 'deferred'
  priority_score          REAL DEFAULT 0.5,
  context_summary         TEXT                   -- one-line summary for triage display
);
CREATE INDEX idx_triage_pending ON triage_items(item_type, surfaced_at DESC) WHERE resolved_at IS NULL;
CREATE INDEX idx_triage_entity ON triage_items(related_entity_type, related_entity_id);

-- Brief generation log: what ran when, output, success/failure.
CREATE TABLE brief_runs (
  id                  TEXT PRIMARY KEY,
  brief_type          TEXT NOT NULL CHECK (brief_type IN (
    'engagement_daily', 'arena_weekly'
  )),
  scope_type          TEXT NOT NULL,             -- 'engagement' or 'arena'
  scope_id            TEXT NOT NULL,
  output_path         TEXT NOT NULL,
  ran_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_ms         INTEGER,
  success             BOOLEAN NOT NULL DEFAULT 1,
  error_message       TEXT
);
CREATE INDEX idx_briefs_scope ON brief_runs(scope_type, scope_id, ran_at DESC);

-- Processor run log: the cron pipeline. Useful for observability.
CREATE TABLE processor_runs (
  id              TEXT PRIMARY KEY,
  pipeline        TEXT NOT NULL CHECK (pipeline IN (
    'inbox_sweep', 'migration_batch', 'state_inference', 'kg_render', 'brief_generation'
  )),
  started_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMP,
  items_processed INTEGER,
  items_failed    INTEGER,
  notes           TEXT
);
CREATE INDEX idx_proc_runs ON processor_runs(pipeline, started_at DESC);

-- ============================================================================
-- DESIGN NOTES
-- ----------------------------------------------------------------------------
-- 1. ID strategy: TEXT primary keys, generated by Loom Core.
--    Recommended: ULID (sortable, time-ordered, 26 chars). UUIDv7 also works.
--    Avoid: integer auto-increment (reveals counts; harder to merge across systems).
--
-- 2. Soft delete vs hard delete:
--    - dismissed flag on atoms and atom_attachments is soft (training signal).
--    - closed_at on engagements/hypotheses/arenas is soft (retention awareness).
--    - Hard delete only when retention scheduler runs explicit purges
--      (NDA-driven, IRAS-window, etc. — none in v1 work scope).
--
-- 3. Polymorphic references (entity_type + entity_id in entity_pages,
--    entity_tags, triage_items, work_stakeholder_roles.scope_id):
--    SQLite can't enforce FK across polymorphic targets. Loom Core enforces
--    referential integrity at write time. Trade-off accepted for simpler queries.
--
-- 4. Denormalization: hypotheses cache current 3-dimensional state.
--    Loom Core MUST update both hypothesis_state_changes (audit) and the
--    hypotheses denormalized columns in the same transaction.
--
-- 5. Anchor uniqueness: enforced via partial unique indexes on atoms
--    (event_id, anchor_id) and (artifact_id, anchor_id). Anchor IDs scope
--    to their parent page, not globally.
--
-- 6. Provenance is structural: every state-bearing fact reaches source content
--    via FKs. atom -> event -> source_path. state_change -> atoms -> events.
--    No path is hidden in JSON or free text.
--
-- 7. JSON columns (stakeholders.aliases, events.source_metadata): used only
--    where shape varies legitimately by source. Indexed columns and CHECK
--    constraints are preferred for any field queried by name.
--
-- 8. WAL mode: Loom Core is the only writer; readers (cron jobs reading
--    historical state, future debugging) get consistent snapshots without
--    blocking writes.
-- ============================================================================
