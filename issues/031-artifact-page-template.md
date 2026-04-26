# 031 — KG render: artifact page template with version history

**Workstream:** W6
**Tag:** AFK
**Blocked by:** #027
**User stories:** US-26, US-30

## Behaviour

Artifacts (notebooks: research, brainstorm, draft, decision record) have a vault page at `outbox/work/artifacts/{artifact_id}.md` and their version content at `notebooks/work/{artifact_id}/current.md`. The KG page is the index; the actual content lives in the notebook path. Version history is listed in the index page. When `write_to_notebook` (MCP) adds a new version, both the notebook content file and the KG index page are updated.

## Acceptance criteria

- [ ] Creating an artifact (via service or MCP `write_to_notebook`) writes `notebooks/work/{artifact_id}/current.md` with the content.
- [ ] The dispatcher writes `outbox/work/artifacts/{artifact_id}.md` as the index page with frontmatter: `id`, `name`, `type_tag`, `created_at`, `last_modified_at`.
- [ ] The index page's ## Versions section lists version number, `content_path`, `authorship`, `created_at` for each version.
- [ ] A new `artifact_versions` row is created for each write (version_number auto-incremented, `content_path` pointing to `notebooks/work/{artifact_id}/versions/v_{n}.md`).
- [ ] `artifacts.last_modified_at` is updated on each new version.
- [ ] A Jinja2 unit test with fixture artifact + 3 versions asserts version list is correct.

## Notes

Template: `loom-core/src/loom_core/vault/templates/artifact.md.j2`.

Vault layout: `notebooks/work/{artifact_id}/current.md` is always the latest version (a copy of the most recent `v_N.md`). Versions directory: `notebooks/work/{artifact_id}/versions/`.

`artifact_versions.authorship` values: `human`, `claude`, `collaborative`. When `write_to_notebook` is called from MCP, `authorship = claude`. When Phani edits directly, `human`. No need to auto-detect; the caller specifies.

Service: `loom-core/src/loom_core/services/artifacts.py`.
