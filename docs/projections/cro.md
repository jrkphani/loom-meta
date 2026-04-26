# Loom — CRO / Day-Job Projection

**Domain:** work
**Author:** Phani
**Version:** 0.2 · April 2026
**References:** `loom-blueprint.md` v0.2

---

## 0. About This Document

This is the **work-domain projection** of Loom — the day-job projection for a CRO at 1CloudHub. It fills in the blueprint's slots with work-specific vocabulary, atom set, cadence, and retention rules.

It does not redefine blueprint primitives. Where this projection extends the blueprint (additional atom types, additional event types, additional read tools), extensions are explicit and labelled.

This is the worked example. Other domain projections (finance, health, content, code, personal) follow the same structure.

---

## 1. Vocabulary

| Blueprint primitive | Work-domain term |
| ------------------- | ---------------- |
| Domain              | Work             |
| Arena               | Account          |
| Engagement          | Engagement (delivery wave, project, ongoing support) |
| Process             | Meeting          |
| Process transcript  | Teams transcript |

Stakeholder vocabulary uses the blueprint's universal role labels (sponsor, beneficiary, blocker, validator, advocate, doer, influencer, advisor, decision-maker, informed-party). No work-specific extensions.

---

## 2. Hypothesis Structure

**Two layers, per the blueprint.**

**Account-level hypotheses** are long-arc bets that span engagements. They move slowly and outlast individual SOWs. Examples:

- *"Panasonic becomes a reference account for SAP-on-AWS in Japan-HQ'd manufacturers."*
- *"Five Star expands beyond Phase 1b into a full digital lending stack."*
- *"SMART converts the Phase 1 modernisation into a multi-year managed-services relationship."*

**Engagement-level hypotheses** are proximate bets that validate or threaten account-level bets. Examples within Panasonic Wave 2:

- *"Wave 2 hits cost outcome."*
- *"Wave 2 hits timeline."*
- *"Wave 2 establishes the foundation for Wave 3 scoping."*
- *"Wave 2 maintains Madhavan's internal advocacy."*

**Sizing.** Engagements typically carry 3–7 hypotheses, sized to the natural fault lines along constraint axes (time, budget, people, scope). SaladStop at SGD 150K may have three. Panasonic Wave 2 with executive escalation may have five or six. The discipline is "however many independent bets exist," not picking a number.

**Cross-account themes** ("Spring of AI unlocks Agentic AI pipeline," "VMware exit motion across SEA enterprise") emerge through tagging and aggregation across account hypotheses, not as a third layer.

---

## 3. Atoms

**Atom set: blueprint v1 (decision, commitment, ask, risk, status update).** No work-domain extensions.

Notes specific to this projection:

- **Asks** are first-class for this domain because of the AWS-funded deal motion. The seven consolidated asks in the PBP (Spring of AI validation, ModNet enrollment, Concierto endorsement, etc.) live as ask atoms with lifecycle (raised → acknowledged → in-progress → granted/declined).
- **Commitments** carry direction (1CloudHub-to-customer, customer-to-1CloudHub, 1CloudHub-to-AWS, AWS-to-1CloudHub). The direction informs which stakeholder is the owner.
- **Status updates** include external developments (e.g., "AWS Singapore segment review moving up two weeks") that affect engagements but aren't formal decisions.

---

## 4. Events

**Universal event types from the blueprint, all in use.** No work-specific event types beyond the universal set.

**Process events** in this domain are specifically:

- Teams meetings (transcripts pulled via existing `outlook-mcp` Teams tools)
- Customer site visits (dictated post-meeting notes)
- AWS partner reviews
- Internal 1CloudHub strategy and review meetings

---

## 5. Stakeholder Model

Stakeholders are predominantly **external named individuals** with active relationships:

- Customer-side: sponsors, decision-makers, doers, internal advocates, blockers
- AWS-side: account managers, segment leads, partner team
- Internal 1CloudHub: account team members, delivery team, executive sponsors

**Cross-domain stakeholder behaviour:** an individual may also be a stakeholder in the personal domain (a contact, a friend) or finance domain (an investor, an advisor). Per the blueprint, the entity is global; role labels are scoped per domain. No information leakage.

**Entity resolution.** Stakeholders typically resolve cleanly via email addresses (customer email domains, AWS @amazon.com, internal @1cloudhub.com). Free-text mentions in dictated notes ("Madhavan said...") use the stakeholder review queue.

**Sensitive role:** internal-advocate. When an individual is flagged as internal advocate (e.g., Madhavan defending 1CloudHub at Panasonic), confidence and momentum inferences about them are tracked operationally but never persisted to archive — per blueprint principle that interpretive content has a half-life. Decisions and commitments by them are facts and persist normally.

---

## 6. Inputs (Domain-Specific)

Per the blueprint's universal input types, with these specifics:

| Input type             | Source                                             |
| ---------------------- | -------------------------------------------------- |
| Process transcripts    | Teams via `outlook-mcp` Teams tools                |
| Dictated notes         | iPhone dictation into Obsidian Mobile (`inbox/work/`) |
| Email threads/excerpts | Forwarded to Obsidian inbox; or read live by Claude via `outlook-mcp` (atoms extracted, snapshot stored, message ID retained as live link) |
| Typed quick notes      | Mac or phone keyboard into Obsidian inbox          |
| Research events        | Claude-authored research artifacts (e.g., competitive landscapes, account briefings) |
| External references    | Customer documents (web links, SharePoint, Google Drive) — captured per live-link-plus-snapshot pattern |

**Email handling clarification:** emails accessed live via `outlook-mcp` are not duplicated into Loom. The atoms extracted and a brief snapshot of the finding are stored; the original lives in Outlook with a message ID retained as the live link.

---

## 7. Cadence

**Pre-generation:**

- **Weekday 7am:** engagement-level briefs for active engagements.
- **Sunday evening:** account-level briefs.

**Triage:**

- **Engagement-level triage:** weekly. Friday afternoon or Monday morning. Target time: 5–10 minutes per active engagement per week.
- **Account-level triage:** monthly, aligned with steering committee preparation cycles.

**Backlog handling:** if an engagement triage is skipped, the next cycle's surface flags it (*"two weeks since last triage on Panasonic Wave 2 — N atoms, M hypothesis-state proposals pending"*). No automatic compounding penalty; the queue grows but the system makes the cost visible.

**Minimum viable triage** when time is short: review only the highest-confidence hypothesis-state proposals; defer atom dismissal to the next cycle.

---

## 8. Read Tools

**Universal blueprint tools, all applicable.** No work-domain-specific tool extensions in v1.

The seven domain-relevant universal tools, called against `domain="work"`:

1. `get_engagement_brief("work", engagement_name)`
2. `get_arena_brief("work", account_name)` — account-level brief
3. `get_open_commitments("work", scope, owner=None, days=14)`
4. `get_recent_decisions("work", scope, days=14)`
5. `get_open_asks("work", scope, side=None)` — side ∈ {asks-of-AWS, asks-of-customer, asks-of-1CloudHub}
6. `get_risk_register("work", scope)`
7. `get_pending_reviews("work", scope)`

Plus the universal `get_atom_provenance(atom_id)` and the artifact tools `get_notebook(name)` / `write_to_notebook(name, content, version_intent)`.

---

## 9. Retention

**Defaults from the blueprint apply, unmodified:**

- 0–6 months: full fidelity
- 6–12 months: mid-term
- 12+ months: archive

**Sensitivities specific to this domain:**

- Customer NDAs may impose deletion obligations. Loom's archive is grep-able by Claude on explicit reach-back; if a customer NDA requires deletion, the archive is hard-deleted (not just demoted) for that engagement. This is an explicit human-triggered action, not automatic.
- Internal political readings of customer stakeholders (e.g., "Madhavan's positioning is hardening") are interpretive content per the blueprint and never persisted to archive.

---

## 10. Privacy Posture

**Domain isolation.** Work briefs never include content from health, finance, or personal domains. Cross-domain queries require explicit cross-domain scope.

**Within-domain access.** Single-user system; no per-account access controls in v1.

**Sharing.** Briefs may be shared externally (with team members, with executive leadership) on user-initiated export. Loom does not auto-share. Exported briefs lose Loom's interactive provenance dereferencing — the export is a snapshot.

---

## 11. Behavioural Ritual

**The most consequential design decision for this projection's success.** Per blueprint section 14.

**Triage ritual:**

- **Calendar block:** Friday 4–5pm. Recurring weekly. Held against meeting requests except for genuine escalations.
- **Time budget:** ~10 minutes per active engagement, capped at 60 minutes total. If the queue exceeds the budget, the system flags overflow and the user defers explicitly rather than rushing.
- **Sequence:** open Loom on Mac → review pending hypothesis-state proposals (highest priority — these are inferences awaiting confirmation) → triage candidate atoms per active engagement → dismiss-or-attach unattached events.
- **What gets dropped first when time is short:** atom dismissal (low-stakes, can compound a cycle). What's protected: hypothesis-state confirmation (high-stakes, drives Tuesday briefs).

**Account-level review ritual:**

- **Cadence:** monthly, last Sunday evening of the month, approximately 30 minutes.
- **Purpose:** review account-level hypothesis state, confirm or override inferences, identify cross-engagement patterns.
- **Output:** annotated account-level briefs ready for Monday morning.

**Skip handling.** A single skipped triage week is recoverable and surfaces as a backlog warning. Two consecutive skipped weeks trigger an explicit nudge: the system writes a top-of-brief message *"Triage backlog is now 2 weeks; consider a longer block or partial pass to prevent silting."* Three consecutive skips and the system stops generating proposed state transitions until triage resumes — degrading gracefully rather than letting unreviewed inferences pile up and pollute the briefs.

---

## 12. Risks Specific to This Projection

**Engagement granularity drift.** The 3–7 hypotheses per engagement guidance is easy to violate in the wrong direction (12+ hypotheses for a complex engagement, collapsing into a task tracker). Mitigation: explicit hypothesis count check during arena-level review; consolidate or split when count is out of band.

**Stakeholder bloat.** Easy to import every meeting attendee as a stakeholder. Most are not. Stakeholders should be people whose actions, positioning, or decisions materially affect a hypothesis. Mitigation: stakeholder review queue includes a "promote to first-class stakeholder?" prompt rather than auto-promotion.

**Email-based atom extraction.** Email is messier than transcripts. Recall-favouring extraction will produce more noise from email than from Teams transcripts. Triage will need to absorb that. Acceptable v1 trade-off.

**External advocate confidence inferences becoming load-bearing.** The internal-advocate role (Madhavan defending 1CloudHub) carries elevated risk if confidence inferences leak into decisions. Strict enforcement of the blueprint principle: confidence is interpretive, not fact, and never persists past operational window.

---

## 13. Open Questions Specific to This Projection

- **Engagement closure.** When does an engagement formally close in Loom — at SOW completion? Post-implementation review? When is the first arena-level brief regenerated to reflect the closure?
- **AWS partner-team modeling.** AWS partner contacts (Desiree, July, the segment leads) are stakeholders in 1CloudHub's accounts but also constitute their own "AWS partnership" arena that arguably deserves first-class hypothesis tracking ("ModNet enrollment establishes credibility for managed services pursuit"). Worth deciding whether AWS gets an arena entry.
- **PBP integration.** The Partner Business Plan with AWS is itself an artifact (in blueprint terms) but also drives account-level hypotheses. Does the PBP live as a notebook artifact, generate publication events, or have a hybrid status?

---

*End of v0.2 CRO projection.*
