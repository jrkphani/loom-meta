# 062 — loom-ui: stakeholder and atom provenance views

**Workstream:** W11
**Tag:** AFK
**Blocked by:** #059, #039
**User stories:** US-27, US-29

## Behaviour

Phani can navigate to a stakeholder's record from any atom's owner field or from the hypothesis detail view's atom list. The stakeholder view shows the stakeholder's canonical details, their roles across engagements/arenas, and their open commitments and asks. An atom provenance view (reachable from any atom) shows the source event and external references, with a button to open the vault page in Obsidian.

## Acceptance criteria

- [ ] `StakeholderDetailView` shows: canonical_name, organization, primary_email, aliases, roles (grouped by scope), open commitments (items with `current_status = open | in_progress`), open asks.
- [ ] Stakeholder detail is reachable by tapping an owner name in any atom list.
- [ ] `AtomProvenanceView` shows: atom content, anchor_id, event type, occurred_at, source_path, linked external references.
- [ ] "Open in Obsidian" button on `AtomProvenanceView` opens `obsidian://open?vault=Loom&file=outbox/work/events/{event_id}` with the anchor.
- [ ] A ViewModel unit test for StakeholderDetailView with mocked roles and open commitments.

## Notes

These are secondary navigation views — they don't appear in the sidebar, they're navigated to from other views via `NavigationLink` or sheets.

The stakeholder roles need `GET /v1/stakeholders/:id/roles`. The open commitments use `GET /v1/atoms?type=commitment&dismissed=false` filtered by owner.

For the atom provenance view, call `GET /v1/atoms/:id/provenance` which returns the full chain. This was implemented in #016.
