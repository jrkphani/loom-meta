# 074 — Disaster recovery runbook

**Workstream:** W13
**Tag:** HITL
**Blocked by:** none
**User stories:** US-35

## Behaviour

A disaster recovery runbook is written documenting: how to restore from a SQLite backup snapshot, how to restart all three daemons (Loom Core, Apple AI sidecar, loom-mcp), how to identify and resolve vault iCloud sync conflicts, and the retention policy for backups and vault files. This is a living document, not automated infrastructure.

## Acceptance criteria

- [ ] `loom-meta/docs/runbooks/disaster-recovery.md` documents: restore procedure from SQLite backup, daemon restart commands, iCloud conflict resolution, backup retention policy.
- [ ] Restore procedure includes: `loom doctor` to verify current state, stop Loom Core, copy backup over active DB, restart Loom Core, verify health.
- [ ] Daemon restart commands reference the correct `launchctl` invocations.
- [ ] iCloud conflict resolution notes how to identify `.conflict` files in the vault and merge them.
- [ ] A human reads and approves the runbook before marking complete.

## Notes

HITL because a runbook requires human review — automated testing cannot verify the accuracy of disaster recovery instructions.

The runbook references `loom-system-design-v1.md §14` (disaster recovery section). Implement what the system design document specifies. If §14 is underspecified, surface the gaps in the runbook as open questions for the user to resolve.

The backup snapshots are at `~/Library/Application Support/Loom/backups/loom_{YYYY-MM-DD}.sqlite` (from #070).
