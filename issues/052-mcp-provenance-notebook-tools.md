# 052 — MCP tools: atom provenance and notebook read/write

**Workstream:** W10
**Tag:** AFK
**Blocked by:** #001, #016
**User stories:** US-24, US-25, US-26

## Behaviour

`get_atom_provenance` lets Phani ask "show me where this came from" for any atom — it returns the source excerpt, event metadata, and any linked external references. `get_notebook` reads an artifact's current content. `write_to_notebook` creates or updates a notebook artifact, storing the content in the vault and writing a new version.

## Acceptance criteria

- [ ] `get_atom_provenance(atom_id)` calls `GET /v1/atoms/:id/provenance` and returns: atom content, anchor_id, parent event type + occurred_at + source_path, and any external references.
- [ ] `get_notebook(artifact_id)` calls `GET /v1/artifacts/:id` and reads the current notebook content from the vault path; returns the markdown content.
- [ ] `write_to_notebook(artifact_id?, name, content, type_tag?)` creates or updates a notebook artifact: if `artifact_id` is None, creates a new artifact; otherwise appends a new version. Returns the artifact_id and new version number.
- [ ] `write_to_notebook` calls `POST /v1/artifacts` (create) or `POST /v1/artifacts/:id/versions` (update); the vault notebook file is written by Loom Core.
- [ ] All three tools tested with mocked HTTP client + fixture responses.

## Notes

Tool files: `loom-mcp/src/loom_mcp/tools/provenance.py`, `…/tools/notebooks.py`.

The `source_path` returned by provenance is a filesystem path on the Mac. Claude cannot open local files directly, but it can report the path so Phani knows where to find the original.

`write_to_notebook` with `authorship = claude` is the standard for MCP-initiated writes. Loom Core writes the actual file; the MCP tool only calls the HTTP API.

The artifact service in loom-core needs `POST /v1/artifacts` and `POST /v1/artifacts/:id/versions` endpoints (these can be thin CRUD wrappers around the `artifacts` and `artifact_versions` tables).
