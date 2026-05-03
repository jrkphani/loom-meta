# 076 — v0.8 consolidated schema migration

**Workstream:** W15
**Tag:** HITL
**Blocked by:** #003
**User stories:** none (foundational refactor)

## Behaviour

A single Alembic migration brings loom-core into structural alignment with Personal OS blueprint v0.8. All v0.5–v0.8 schema additions land in one migration to avoid partial-state confusion. Adds visibility, retention, and projection-at-creation columns to every state-bearing table; adds extractor/inference model-version metadata to atoms and `hypothesis_state_changes`; adds time-bounded `stakeholder_roles` and audience-profile fields on stakeholders; adds `atom_contributions` (forward provenance), atom retraction columns, and the resources/leverage tables. Default values backfill existing rows so the migration is forward-only and non-disruptive.

## Acceptance criteria

- [ ] Single Alembic migration file `2026_05_XX_w15_001_v08_schema_alignment.py` lands in `alembic/versions/`.
- [ ] `visibility_scope` column added to `events`, `atoms`, `hypotheses`, `artifacts`, `artifact_versions`, `external_references` with CHECK constraint (`domain_wide | engagement_scoped | stakeholder_set | private`) and default `'private'`.
- [ ] `retention_tier` column added to `events`, `atoms`, `hypotheses`, `artifacts`, `artifact_versions`, `external_references`, `engagements` with CHECK constraint (`operational | archive_soon | archived | purge_eligible`) and per-table index.
- [ ] `projection_at_creation` column added to `events`, `atoms`, `hypotheses`, `artifacts`, `engagements`, `arenas` with default `'work-cro-1cloudhub-v1'`.
- [ ] `entity_visibility_members` link table created with composite PK `(entity_type, entity_id, stakeholder_id)`, CHECK on `entity_type`, and `idx_evm_lookup` covering `(entity_type, entity_id)`.
- [ ] `atoms` gains `extractor_provider` (CHECK: `python_rules | embeddings | apple_fm | claude_api | human`), `extractor_model_version`, `extractor_skill_version`, `extraction_confidence`, `source_span_start`, `source_span_end` (all nullable for human-created atoms).
- [ ] `atoms` gains `retracted` (default 0), `retracted_at`, `retraction_reason` (CHECK: `hallucination | wrong_extraction | stale_source | corrected_on_review`); partial index `idx_atoms_retracted` on `retracted = 1`.
- [ ] `hypothesis_state_changes` gains `inference_provider`, `inference_model_version`, `inference_skill_version`.
- [ ] `brief_runs` gains `composer_skill_version` and `provider_chain` (JSON).
- [ ] `stakeholder_roles` table created with `started_at` / `ended_at`, `scope_type` (`arena | engagement | domain`), role enum per blueprint v0.8 (`sponsor | beneficiary | blocker | champion | gatekeeper | collaborator | aws_partner_am | customer_exec | internal_team`), partial index on currently-active roles.
- [ ] `stakeholders` gains `audience_schema` (CHECK: `executive | technical | aws_partner | customer_sponsor | visual`), `preferred_depth`, `preferred_channel`, `tone_notes` (all nullable).
- [ ] `atom_contributions` table created (forward provenance) with composite PK `(atom_id, consumer_type, consumer_id)`, CHECK on `consumer_type` (`brief_run | state_change | draft | sent_action | derived_atom`), and `idx_ac_consumer`.
- [ ] `resources`, `resource_attributions`, `asset_uses` tables created per refactor plan §1.8 with required CHECK constraints and indexes.
- [ ] All ORM models in `storage/models.py` updated to mirror migration changes; `mypy --strict` passes.
- [ ] `alembic check` passes (ORM matches latest migration head).
- [ ] Pre-migration backup ritual documented in `alembic/README.md`: `cp loom.db loom.db.pre-v08-$(date +%s)`.
- [ ] All four CI gates pass (ruff + ruff format + mypy --strict + pytest).
- [ ] `python -m loom_core.cli doctor` passes post-migration.

## Notes

HITL because the migration touches every operational table on a live database; the verification ritual (dry-run on copy, backup, then forward) needs human eyes.

Refactor plan reference: §1.1 through §1.9 of `loom-meta/docs/v08-alignment-refactor-plan.md` (the doc shared at the start of W15 — copy in as part of this issue's PR).

Per blueprint §6.5, visibility filtering happens at the SQL level via WHERE-clause builder. The link table `entity_visibility_members` is preferred over a JSON array column because JOIN-based filtering against an indexed link table is dramatically faster than JSON containment for loom-core's access patterns.

Per blueprint §11.9, this migration is treated as a replayable operation: backup before, transaction-wrapped (Alembic default for SQLite), forward-only.

The deferred `work_stakeholder_roles` table mentioned in `models.py` comments is NOT introduced — it is superseded by `stakeholder_roles` (no `work_` prefix, projection-agnostic) per #088 (which replaces the original #039).

`extraction_confidence` and `source_span_*` enable §13.9 extraction-discipline checks (atoms below 0.6 surface in triage; atoms with no source span flag as unsupported). Hooked at the cognition layer in #082, not enforced at the schema layer.

Lives in `loom-core/alembic/versions/` and `loom-core/src/loom_core/storage/models.py`.
