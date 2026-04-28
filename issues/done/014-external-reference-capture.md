# 014 — External reference capture: live link and snapshot

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #007
**User stories:** US-4, US-25

## Behaviour

When Phani pastes an email message ID, URL, or git commit hash into a note or the API, Loom captures it as an `external_references` row: a typed pointer plus a snapshot summary. The original lives in Outlook (or GitHub, or SharePoint); Loom never duplicates it. Atoms can cite external references via `atom_external_refs`. The `external_ref_verify` cron checks URL reachability weekly and flips `unreachable` if a URL goes dead.

## Acceptance criteria

- [ ] `POST /v1/external-references` with `{ref_type, ref_value, summary_md_path?}` creates the row; returns 201 with the new resource.
- [ ] Posting the same `(ref_type, ref_value)` pair a second time returns 409 Conflict (UNIQUE constraint enforced).
- [ ] `POST /v1/atoms/:id/external-refs` links an atom to an existing external reference; returns 201.
- [ ] `GET /v1/atoms/:id/external-refs` returns all external references linked to an atom (used for provenance, US-25).
- [ ] `GET /v1/external-references/:id` returns the reference including `unreachable` flag and `last_verified_at`.
- [ ] Unit test: create two refs, link both to one atom, GET provenance returns both.

## Notes

Schema: `external_references` (lines ~320–332), `atom_external_refs` (lines ~335–339) in `loom-schema-v1.sql`.

`ref_type` values: `url`, `email_msgid`, `git_commit`, `sharepoint`, `gdrive`.

The `external_ref_verify` cron (weekly Mon 04:00) is a separate issue (#072 in W13). This issue only handles the CRUD and the atom-linking endpoints.

For email message IDs: the value is the Outlook message ID string, not an Outlook URL. `summary_md_path` points to a compressed summary written to `outbox/work/` by the knowledge graph renderer (W6).
