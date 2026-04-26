# Loom — Content / Machine in the Loop Projection

**Domain:** content
**Author:** Phani
**Version:** 0.1 · April 2026
**References:** `loom-blueprint.md` v0.2

---

## 0. About This Document

This is the **content-domain projection** of Loom — the substrate behind the *Machine in the Loop* content practice. It captures the editorial thinking, the publishing workflow, and the long-arc development of the three pillars (adoption-gap, POC-to-production, ROI-as-adoption) that constitute the personal-brand argument.

The unit of value in this domain is **a perspective shift in a target reader or audience.** Pieces are tactical efforts toward that shift. Pillars are the theses being defended across years. Hypotheses are about which framings, examples, sequences, and openings produce the shift in which audiences.

This projection fills in the blueprint's slots with content-specific vocabulary, atom set, cadence, and retention rules. It does not redefine blueprint primitives.

---

## 1. Vocabulary

| Blueprint primitive | Content-domain term |
| ------------------- | ------------------- |
| Domain              | Content (Machine in the Loop) |
| Arena               | Pillar |
| Engagement          | Campaign |
| Process             | Session |
| Process transcript  | Session capture |

**Pillars** are thesis territories defended across years. Current set: adoption-gap, POC-to-production, ROI-as-adoption. New pillars are deliberate additions, not accidental drift.

**Campaigns** are bounded efforts within a pillar — a keynote and its supporting essays, a sustained LinkedIn arc on a sub-thesis, a podcast tour, a launch tied to a product moment. Sub-typed via tagging (`venue:keynote`, `arc:linkedin`, `tour:podcast`, `essay:longform`). A single LinkedIn post is too small to be a campaign; it is an event or atom. A coordinated set of posts is.

**Sessions** are creation moments — solo dictation, Claude collaboration, recording, editing, batching. Their capture is the equivalent of a Teams transcript in CRO: the highest-fidelity raw input.

**Stakeholder role-label extensions** to the universal set:

- **Audience persona** — an abstraction (the enterprise CTO, the AWS PSA, the practitioner-engineer) rather than a named individual.
- **Amplifier** — someone whose share, quote, or citation expands reach (extension of *advocate*).
- **Source** — someone whose words, case, or example is used in a piece, with consent considerations.
- **Editor / collaborator** — a co-thinker on the piece itself.

Audience personas behave like first-class stakeholders: hypothesis state can attach to them ("the AWS PSA persona finds the hospital example more credible than the legal example") and the system tracks their evolution.

---

## 2. Hypothesis Structure

**Two layers, per the blueprint.**

**Pillar-level hypotheses** are long-arc bets defending the thesis itself. Examples:

- *"Adoption-gap, not capability-gap, is the binding constraint on enterprise GenAI value."*
- *"POC-to-production is where ROI dies, and the failure modes are diagnosable, not mystical."*
- *"ROI is downstream of adoption. Treating it as a finance question, not an adoption question, is why most programs underperform their projections."*

These are the theses themselves. They move slowly. Their progress state moves on multi-month or multi-year horizons. Confidence and momentum shift faster as audience signals accumulate.

**Campaign-level hypotheses** are proximate bets that validate or threaten pillar-level bets. Within (e.g.) a Q3 AWS Summit keynote:

- *"Opening with the hospital example outperforms opening with the legal example for an enterprise-architect audience."*
- *"The 18-minute version lands better than the 25-minute version."*
- *"Closing on an action question outperforms closing on a philosophical one."*
- *"The keynote re-energises the LinkedIn arc that follows it."*

Within a sustained-arc campaign:

- *"Three posts of escalating specificity outperform one synthesis post."*
- *"Naming the failure mode (the 'POC graveyard') hooks better than describing it."*

**Sizing.** Campaigns typically carry 3–5 hypotheses. Fewer than CRO engagements because the constraint axes are tighter (audience, frame, sequencing) and binary outcomes are clearer (a piece either lands or doesn't). The discipline is the same: as many hypotheses as there are independent bets.

**Cross-pillar themes** emerge through tagging — e.g., a *human-in-the-loop-as-default* meta-theme that runs across all three pillars. Surfaced through aggregation, not as a third structural layer.

---

## 3. Atoms

**Universal atom set (decision, commitment, ask, risk, status update) plus two domain-specific extensions.**

Notes on universal atoms in this domain:

- **Decisions** are heavily editorial: framings adopted, examples cut, structures chosen, titles selected. Decisions reference prior versions of the artifact via the artifact's version history.
- **Commitments** are publishing deadlines and deliverable promises. Direction conventions: self-to-audience (publish by X), self-to-collaborator (draft to editor by Y), self-to-venue (final talk by Z).
- **Asks** are less heavily used than in CRO but matter: editor's review pending, quote-permission outstanding, venue confirmation needed.
- **Risks** are reputational, contractual, or strategic. *("Publishing this thread risks signalling a position before the deal closes." "This argument could be misread as anti-OpenAI.")*
- **Status updates** include external signals that aren't formal feedback — a competitor's piece reframing the same thesis, a market event that strengthens or weakens a pillar.

**Domain-specific atom types:**

- **Audience signal** — empirical feedback that a piece, frame, or example landed (or didn't). Source: comment, DM, conversation, citation in someone else's work, engagement-metric anomaly. Carries provenance to the originating event (specific DM, specific comment thread, specific metric snapshot). Distinct from *status update* because audience signals have a longer operational half-life — they are evidence about what works for which audience and persist across campaigns for hypothesis review.
- **Research finding** — a citation, statistic, anecdote, or case usable as evidence in pieces. Reusable across pieces. Provenance to the source (paper, article, conversation, prior piece). Carries a state field: *fresh / used / overused / retired.* Per the blueprint note that finance and content both warrant this atom type.

**Considered and rejected for v1:**

- *Framing* as an atom — instead held in **artifacts** (a framings notebook per pillar) because framings are mutable, versioned, and developed over time. Atoms are not the right shape; artifacts are.
- *Hook* as an atom — same reasoning; lives in the framings notebook with state tags.
- *Anti-pattern* as an atom — captured as dismissed or retired framings in the artifact, with the dismissal reason. The blueprint principle that dismissals are first-class data covers this.

**Extraction is recall-favouring,** consistent with the blueprint. Audience signals especially benefit from generous extraction — a comment that seems trivial in isolation may be evidence in aggregate.

---

## 4. Events

**Universal event types in use:**

- **Process events:** writing sessions, dictation sessions, Claude collaboration sessions, recording sessions, edit-pass sessions. Captured via Superwhisper for dictation, Claude conversation exports for AI-collaborated thinking, transcript capture for recordings.
- **Inbox-derived events:** quick captures, on-the-go notes, ideas jotted between sessions.
- **Hypothesis state-change events:** pillar-level shifts and campaign-level shifts, both first-class.
- **Research events:** Claude-generated research artifacts (competitive landscape of the adoption-gap argument, statistics on AI POC failure rates, prior-art search). Heavy use in this domain — research events feed research-finding atoms.
- **Publication events:** piece published. Reference the artifact (notebook) that produced them. Trigger downstream tracking (engagement-metric snapshots, audience-signal capture).
- **External-reference events:** web clippings, papers, other writers' posts in the same space, citations of own work elsewhere.

**Domain-specific event types:**

- **Engagement-metric snapshot** — a periodic capture of public-platform engagement (LinkedIn views / reactions / comments at 24h / 72h / 1 week / 4 week post-publication). Stored as immutable journal entries, not as a single mutable counter. Trends are derived; raw snapshots are facts.

**Note on Claude conversations.** A Claude conversation that produces a structured finding becomes a *research event* (typed at creation, written directly to the structured store). A Claude conversation that's exploratory thinking becomes a *session* event (process event, treated like a dictation). The distinction is the user's intent at session end, captured at the point the artifact is saved or the session is closed.

---

## 5. Stakeholder Model

**Stakeholders in this domain are predominantly abstractions (audience personas), with named individuals as a thinner secondary layer.** This inverts the CRO domain.

Concrete examples:

- **Audience personas:** enterprise CTO/CIO, AWS PSA, AWS partner-team lead, practitioner-engineer, executive-sponsor (CEO/CFO), peer-thinker (other writers in the space). Each is a stable abstraction with its own evolving reading of the pillars.
- **Named individuals:** editors, collaborators, public figures who engage substantively, sources whose case studies are used (with consent), specific peer-thinkers cited frequently.
- **The future-self stakeholder:** a real abstraction — the version of the user reading their own work two years from now. Tracked because some pieces are written deliberately *for* future-self (synthesis, position-pinning).

**Cross-domain behaviour.** Editors and collaborators may also appear in the work domain (a 1CloudHub colleague who reviews drafts, an AWS partner who is both a content stakeholder and a deal stakeholder). The same global entity, different role labels per domain. No leakage: a content brief never surfaces deal context about that person; a CRO brief never surfaces their content collaboration.

**Entity resolution.** Lower stakes than CRO because most content stakeholders are abstractions. Named individuals resolve via email or platform handle. Audience personas are deliberately created entities, not inferred — they live in a small reference notebook and are explicitly attached.

**Sensitive role: source.** When a piece uses a customer or named individual as an example or case, consent is the operational concern. Loom tracks consent status (*sought / granted / declined / public-record-no-consent-needed*) on the source-stakeholder relationship. Pre-publication review surfaces any sources without granted consent.

---

## 6. Inputs

| Input type             | Source / handling |
| ---------------------- | ----------------- |
| Process transcripts    | Recordings of talks (manual import); Claude conversation exports (saved as session captures) |
| Dictated notes         | Superwhisper into Obsidian Mobile (`inbox/content/`) — heavy use |
| Email threads/excerpts | Editor exchanges, newsletter responses, reader DMs forwarded; or read live via `outlook-mcp` with snapshot |
| Typed quick notes      | Mac or phone keyboard into Obsidian inbox |
| Research events        | Claude-authored research artifacts written directly to structured store |
| External references    | Web clippings, papers, other writers' posts — live link plus snapshot |
| Engagement metrics     | LinkedIn metric snapshots — manual entry in v1, API import in v2 if value-positive |
| Audience inbound       | Comments and DMs — manual capture into inbox in v1; automated ingestion deferred |

**Email handling.** Reader emails responding to published work are inbound audience signals. Captured via paste-into-inbox or via `outlook-mcp` with the live link plus snapshot pattern. Original lives in Outlook.

**LinkedIn data.** Manual snapshot in v1, on a deliberate schedule (24h / 72h / 1 week / 4 week post-publication). API automation deferred until the manual rhythm shows whether the data is actually load-bearing for hypothesis state. The risk of automation here is that quantitative metrics colonise interpretive judgement; manual capture forces a thoughtful read.

---

## 7. Cadence

**Pre-generation:**

- **Sunday evening:** campaign briefs for active campaigns and pillar-level briefs. Aligns the briefs with the existing Sunday batching rhythm.
- **Friday afternoon:** mid-week refresh of active-campaign briefs only. Lightweight — picks up audience signals and metric snapshots from mid-cycle pieces.

**Triage:**

- **Sunday batching session is the triage ritual.** This is the operative behavioural principle for this domain (see Section 11). Triage is not a separate calendar event; it lives inside the batching session because the inputs are mostly the same content (audience signals from the week, research findings from sessions, dictations and notes captured throughout).
- **Engagement-level (campaign) triage:** every Sunday during batching, ~10–15 min per active campaign.
- **Pillar-level triage:** monthly, last Sunday of the month, ~30 min. Cross-campaign patterns and audience-persona evolution.

**Backlog handling.** A single skipped Sunday is recoverable. Two consecutive skips trigger a top-of-brief warning (*"Triage backlog is now 2 weeks; audience signals from N pieces unprocessed"*). Three consecutive skips and the system stops generating proposed hypothesis-state transitions until triage resumes. Same graceful-degradation pattern as CRO; the silting-up risk is identical.

**Minimum viable triage** when time is short: confirm or override pending hypothesis-state proposals only; defer atom triage (audience signals, research findings) to the next cycle. Audience signals tolerate deferral better than CRO's commitments because their operational time-pressure is lower.

---

## 8. Read Tools

**Universal blueprint tools applicable, with `domain="content"`:**

1. `get_engagement_brief("content", campaign_name)` — campaign-level executive view
2. `get_arena_brief("content", pillar_name)` — pillar-level brief
3. `get_open_commitments("content", scope, days=14)` — publishing deadlines, drafts owed, review obligations
4. `get_recent_decisions("content", scope, days=14)` — editorial decisions
5. `get_open_asks("content", scope)` — review-pending, permission-pending, venue-pending
6. `get_risk_register("content", scope)` — reputational and strategic risks
7. `get_pending_reviews("content", scope)` — hypothesis-state proposals, ambiguous routings, audience-signal triage queue
8. `get_atom_provenance(atom_id)` — universal
9. `get_notebook(name)` / `write_to_notebook(name, content, version_intent)` — universal, heavily used in this domain

**Domain-specific read tools:**

- `get_audience_signals(scope, persona=None, days=N)` — signals across pieces, optionally filtered to a persona. Distinct from `get_recent_decisions` because the surface and review semantics differ; signals are evidence to be weighed, not actions to be tracked.
- `get_framing_inventory(pillar)` — framings currently in rotation across the pillar with their state (*fresh / working / tired / retired*) and last-used reference. Reads from the pillar's framings notebook.
- `get_research_findings(pillar, query=None)` — searches the research-finding atom store, scoped to a pillar, with optional keyword filter. Used during piece-drafting to surface previously-captured citations and statistics.
- `get_engagement_metrics(piece_id_or_campaign)` — quantitative side: LinkedIn snapshots, time-series of reach / reactions / comments. Returned as raw, never as derived insight; interpretation happens in the brief layer.

**Grain principle preserved.** Each tool answers a question that gets asked in the moment. The framings inventory tool exists because *"what frames have I used on this argument"* is a real Sunday question.

---

## 9. Retention

**Defaults from blueprint apply with the following modifications:**

- **Published pieces and their associated artifacts:** extended to **0–24 months full fidelity, 24–60 months mid-term, 60+ months archive.** Published thinking has long evergreen value; the user revisits, cites, and develops their own work over multi-year arcs.
- **Research findings:** retain at the same tier as the pillar they support. A research finding tied to an active pillar stays full-fidelity even past 24 months.
- **Audience signals:** retain on the standard atom timeline (0–6m / 6–12m / 12+). They are evidence, not interpretation — the blueprint principle holds.
- **Engagement-metric snapshots:** retain at 24-month full fidelity, then mid-term indefinitely. Trend analysis benefits from long history.
- **Abandoned drafts:** sunset on the standard 90-day-untouched rule per blueprint section 12.5. No retention exception; an abandoned draft is information about what wasn't pursued, but the artifact body itself has no long-term value.

**Domain-specific sensitivities:**

- **Source consent.** A piece that quoted a customer with consent is fine to retain. A piece that *almost* quoted a customer (material exists in working notes but wasn't published) needs to honour the same consent boundary. Loom's archive of working notes is private but should not retain identifying source material past the campaign's close if consent was not granted for the public version.
- **Deal-adjacent thinking.** If a campaign was paused or pivoted because of a related work-domain deal, those connection notes are sensitive and follow the work domain's retention, not the content domain's.

---

## 10. Privacy Posture

**Domain isolation.** Content briefs never include content from work, finance, or personal domains. The reverse is also enforced: working notes from the content domain do not surface in CRO briefs even when they reference the same individual.

**Within-domain access.** Single-user system; no per-pillar access controls in v1.

**Sharing.** Publication is the explicit point of the domain — but Loom does not push to platforms. Drafts may be shared with editors via export (markdown copy of the artifact, provenance stripped). Final pieces are published manually by the user. The hand-off from Loom-private to platform-public is human-mediated, every time.

**Pre-publication privacy review.** Before a piece is exported for publication, Loom surfaces:

- Source-consent status for any named individual referenced
- Cross-domain references that might inadvertently leak (a deal mentioned, a financial position cited)
- Internal-political content from work-domain notes that has been quoted or paraphrased

This is a checklist the system assembles from the artifact's provenance chain. Human judgement still decides.

---

## 11. Behavioural Ritual

**The Sunday batching session is the ritual. This is the most consequential design decision for this projection.**

The user already practises Sunday batching as a content rhythm. Loom does not invent a new ritual; it instruments the one that already exists.

**Sunday batching session sequence:**

1. **Open Loom on Mac.** Read the pre-generated pillar briefs and active-campaign briefs.
2. **Pillar-level review (5–10 min weekly; deeper monthly).** Confirm or override pillar-level hypothesis-state proposals. Note any audience-persona evolution.
3. **Campaign-level triage (10–15 min per active campaign).** Confirm or override campaign-level state proposals. Triage audience signals from the week (attach to hypotheses, dismiss with reason, defer). Triage research findings captured in the week (assign to pillar or piece, dismiss, archive for later).
4. **Inbox sweep.** Dismiss-or-attach unattached events from the week (Claude conversation exports, dictations, web clippings).
5. **Plan the week's writing sessions.** Use the briefs to decide which pieces advance which campaigns; identify which framings are due for retirement; surface research findings ready for use.

**Time budget:** 60–90 minutes total Sunday. Capped at 90.

**What gets dropped first when time is short:** detailed audience-signal triage on quieter campaigns. **Protected:** pillar-level state confirmation, active-campaign hypothesis state, the writing-session plan for the week.

**Daily writing sessions are creation, not triage.** They feed the inbox; the Sunday session processes it. Attempting to triage during a writing session breaks the creative state and produces shallow triage — both lose.

**Pillar-level monthly review (last Sunday of the month, +30 min):** cross-campaign patterns, audience-persona evolution, framings-notebook curation, retirement decisions, new-pillar consideration if a thesis is genuinely emerging.

**Skip handling.** Standard graceful-degradation pattern. One skip is recoverable; two surfaces a warning; three halts state-transition proposals until triage resumes.

---

## 12. Risks Specific to This Projection

- **Metrics gravity.** LinkedIn reach and reactions are seductive and noisy. They can colonise interpretive judgement, displacing the qualitative audience signals that actually carry hypothesis weight. *Mitigation:* keep audience signals first-class, explicitly weighted in brief generation; manual metric capture in v1 to prevent the data deluge.
- **Pillar drift.** Pillars constrain by design, but content velocity creates pressure to write whatever is working this week. Drift erodes the long-arc thesis. *Mitigation:* pillar-level hypothesis state is reviewed monthly with explicit drift detection; new pillar additions require deliberate decision.
- **Framing fatigue.** The same hospital example, the same POC-graveyard frame, the same opening structure — used past their freshness, they signal stagnation rather than depth. *Mitigation:* framings notebook with state (fresh / working / tired / retired); explicit retirement decisions surface during monthly pillar review.
- **Self-citation echo chamber.** Reading the same writers, citing the same sources, developing the same examples. The risk of inbreeding is real. *Mitigation:* research-finding state field (overused) and external-reference imports tagged with novelty; brief layer flags a piece that uses only previously-cited findings.
- **Public/private boundary leakage.** Working notes name customers, deals, individuals. A careless paste from a draft to a published piece is a serious breach. *Mitigation:* pre-publication privacy review (Section 10); Loom does not auto-publish; hand-off is human-mediated.
- **Audience-signal sample bias.** *"Three CTOs told me X"* is not evidence if those three are unrepresentative. *Mitigation:* audience signals carry stakeholder provenance; persona-distribution checks during pillar review.
- **Future-self illegibility.** Notes written in personal shorthand age into nonsense. Loom mitigates partially (provenance and atomic structure preserve some context), but framings notebooks should be written for re-readability, not just for the moment.

---

## 13. Open Questions Specific to This Projection

- **Talks vs. essays — same engagement type or different?** Both are campaigns in v1, sub-typed via tagging. Worth revisiting after a few cycles whether their hypothesis sets diverge enough to warrant distinct types.
- **Pieces spanning multiple pillars.** A piece that develops the adoption-gap thesis *and* the ROI-as-adoption thesis. Currently handled by attaching to multiple pillar hypotheses; may need a clearer convention for primary-vs-secondary attribution.
- **Metric automation timing.** When does manual LinkedIn snapshotting become friction-positive enough to justify API integration? Trigger condition: when the snapshot is being skipped, *or* when manual capture is bottlenecking the brief layer.
- **Multi-author pieces.** A jointly-written piece with a co-author — same artifact model? Or separate co-authored artifact type? Punted to v2.
- **Audience-persona maintenance.** Personas evolve over time. Is there a scheduled "persona review" beyond the monthly pillar review, or does the monthly pillar review absorb it?
- **The future-self stakeholder.** Conceptually clean but operationally untested. Does writing-for-future-self produce different hypotheses? Worth instrumenting once a few synthesis pieces have aged 12+ months.
- **A *Machine in the Loop* meta-artifact.** The CRO projection raises the PBP as a hybrid notebook-with-publication-event status. Is there an equivalent here — a master document for the *Machine in the Loop* practice itself that drives pillar hypotheses (a manifesto, a positioning doc)? Likely yes, but its shape needs design.

---

*End of v0.1 content / Machine in the Loop projection.*
