# 076 — v0.8 consolidated schema migration

**Workstream:** W15
**Tag:** HITL
**Blocked by:** —
**User stories:** none directly (foundation for visibility-aware reads, cognition, leverage, retraction, audience profile)

## Behaviour

A single Alembic migration brings the loom-core schema into alignment with Personal OS blueprint v0.8. The migration is additive — it adds columns, tables, and indexes; it does not drop, rename, or reshape existing data. After the migration runs, every state-bearing entity carries `visibility_scope`, `retention_tier`, and `projection_at_creation`; inference-derived rows carry model/skill version metadata; stakeholder role periods, audience profiles, forward-provenance index, retraction columns, resources/leverage entities, and asset-saturation tracking all exist as empty (or default-populated) tables.

The migration is large and touches every operational table, so it is a HITL-trigger migration: backup, run on a copy first, verify gates, then run on dev DB.

## Acceptance criteria

- [ ] A single Alembic file `2026_05_XX_phaseA_001_v08_schema_alignment.py` is created and applies cleanly on top of the current head (`2026_04_26_b3036cdd7161`).
- [ ] `visibility_scope TEXT NOT NULL DEFAULT 'private'` is added to: `events`, `atoms`, `hypotheses`, `artifacts`, `artifact_versions`, `external_references`. Each has a CHECK constraint enumerating `('domain_wide', 'engagement_scoped', 'stakeholder_set', 'private')`.
- [ ] `entity_visibility_members` link table is created with composite PK `(entity_type, entity_id, stakeholder_id)` and an index `idx_evm_lookup` on `(entity_type, entity_id)`.
- [ ] `retention_tier TEXT NOT NULL DEFAULT 'operational'` is added to: `events`, `atoms`, `hypotheses`, `artifacts`, `artifact_versions`, `external_references`, `engagements`. Each has a CHECK and a per-table `idx_*_retention` index.
- [ ] `projection_at_creation TEXT NOT NULL DEFAULT 'work-cro-1cloudhub-v1'` is added to: `events`, `atoms`, `hypotheses`, `artifacts`, `engagements`, `arenas`. Default backfills existing rows.
- [ ] On `atoms`: nullable columns added — `extractor_provider`, `extractor_model_version`, `extractor_skill_version`, `extraction_confidence` (Float), `source_span_start` (Integer), `source_span_end` (Integer). CHECK constraint on `extractor_provider`.
- [ ] On `atoms`: retraction columns added — `retracted` (Boolean default 0), `retracted_at` (DateTime), `retraction_reason` (Text). CHECK constraint on `retraction_reason`. Partial index `idx_atoms_retracted` `WHERE retracted = 1`.
- [ ] On `hypothesis_state_changes`: nullable `inference_provider`, `inference_model_version`, `inference_skill_version` columns added.
- [ ] On `brief_runs`: nullable `composer_skill_version` (Text), `provider_chain` (JSON) columns added.
- [ ] On `stakeholders`: nullable `audience_schema`, `preferred_depth`, `preferred_channel`, `tone_notes` columns added. CHECK on `audience_schema` enum.
- [ ] `stakeholder_roles` table created (id, stakeholder_id, domain, scope_type, scope_id, role, started_at, ended_at, created_at) with CHECKs on `scope_type` and `role`, and partial index `idx_sr_current WHERE ended_at IS NULL`.
- [ ] `atom_contributions` table created with composite PK `(atom_id, consumer_type, consumer_id)`, CHECK on `consumer_type` enum, and `idx_ac_consumer` index.
- [ ] `resources` table created with all category/quality/window/expiry columns plus CHECK constraints; `idx_resources_category` and partial `idx_resources_expiry` indexes.
- [ ] `resource_attributions` table created with FK to resources, CHECK on `consumer_type`, two indexes.
- [ ] `asset_uses` table created with `idx_asset_uses` index.
- [ ] After applying, `python -m loom_core.cli doctor` reports green and `alembic check` confirms ORM models match migration head (gate from #079).
- [ ] A pre-migration backup ritual is documented in the migration file's docstring: `cp loom.db loom.db.pre-v08-$(date +%s)` plus rollback instructions.

### Pre-existing gap: `processor_runs.success` column

Folded in from #009 follow-up. The `success` column was never created despite #009's prior implementation. Add as part of #076's consolidated migration:

- Schema: `success BOOLEAN NOT NULL DEFAULT 1` on `processor_runs`
- ORM: `success: Mapped[bool]` on `ProcessorRun` (loom-core/src/loom_core/storage/models.py)
- Service: `success: bool` parameter on `finish_processor_run` (loom-core/src/loom_core/services/processor_runs.py)
- Caller: `inbox_sweep_job` passes `success=True` (loom-core/src/loom_core/pipelines/inbox_sweep.py)
- API: `success: bool` on `PipelineRunSummary` + endpoint mapping (loom-core/src/loom_core/api/health.py)
- Tests: extend existing tests with `assert summary["success"] is True` and `assert finished.success is True`

## Notes

The full DDL is in `loom-meta/docs/loom-v08-alignment.md` §1.1–§1.8. Treat that document as the spec and this issue as the build/verify ticket.

Schema design rationale (from refactor plan):
- A separate `entity_visibility_members` table rather than a JSON array column on each entity, because visibility filtering is a SQL `WHERE` clause on every read path; JOIN against an indexed link table is dramatically faster than JSON containment for loom-core's access patterns.
- Default `retention_tier='operational'` and `projection_at_creation='work-cro-1cloudhub-v1'` backfills cleanly for existing rows.
- Visibility default is `private` at the column level, which is the safest pre-attachment default. Service code applies the right scope at attachment time (events get `engagement_scoped` when attached to an engagement, etc.).

ORM model updates land in the same change as this migration:
- New SQLAlchemy classes for `EntityVisibilityMember`, `StakeholderRole`, `AtomContribution`, `Resource`, `ResourceAttribution`, `AssetUse`.
- New columns on existing classes: `Event`, `Atom`, `Hypothesis`, `Artifact`, `ArtifactVersion`, `ExternalReference`, `Engagement`, `Arena`, `Stakeholder`, `HypothesisStateChange`, `BriefRun`.

Tagged HITL because:
1. Single migration touches every operational table.
2. Backup-before-run ritual must be human-verified.
3. ORM model rewrites are non-trivial and benefit from human eyes.

After this lands, every issue from #077 onwards in the v0.8 alignment workstream is unblocked.

## Closure Note

Phase 1 (migration + ORM) and Phase 2 (schema doc reconciliation and env.py alembic check drift fix) are fully complete. Migration applies cleanly, the test suite is green, and `alembic check` correctly reports no drift. Closing issue.
