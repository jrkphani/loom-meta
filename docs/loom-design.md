# Loom — Design Document

**A personal knowledge fabric for evidence-based, value-anchored thinking across work and life.**

Version 0.1 · April 2026 · Author: Phani

---

## 1. What Loom Is

Loom is a personal knowledge fabric. Not a notes app, not a CRM, not a database — a substrate where events (things that happened), atoms (things that were decided, committed, asked, risked, reported), and hypotheses (bets you're making) interlock with full provenance, so that current state can always be traced back to the evidence that produced it.

The metaphor: a loom weaves fabric from threads. Hypotheses are the warp (lengthwise threads holding structure over time). Events are the weft (the daily crossings). State emerges from their interweaving. Provenance is the integrity of the weave.

Loom is designed around one principle: **evidence is sovereign, interpretation is provisional.** Facts about what was decided or committed are durable and traceable. Inferences about how things are going (confidence, momentum) exist for current operations only and never accrete into long-term memory. The system keeps the minutes, not the hallway conversations.

Loom is Claude-first by surface. The MCP server is the primary product. Obsidian projections are the fallback when Claude is unavailable.

---

## 2. Core Design Principles

These emerged from the design conversation as repeated, consistent choices. They should govern future decisions.

**Evidence first, always.** Progress on any hypothesis is established by evidence (atoms with provenance), never by inference. Inferences (confidence, momentum) are interpretive layers explicitly labeled as such and never load-bearing without human sign-off.

**Recall over precision at every extraction surface.** The system extracts generously and lets human dismissal teach it what's noise. A junior analyst who over-flags and learns from edits becomes excellent in twelve months; one who only raises high-confidence findings stays cautious forever.

**Human correction is the learning signal.** Every interface where ambiguity meets human judgment — atom dismissal, hypothesis attachment, state transition review, route correction — captures the correction as first-class data. The system improves through use, not through external retraining.

**Propose generously, never act silently.** The system suggests; the human confirms. State changes that move strategy never happen without human sign-off. The system is a briefing officer, not a decision-maker.

**Provenance is structural, not decorative.** Every state-bearing fact links to the source events that produced it. Every event links to the source artifact (transcript paragraph, email excerpt, dictation file). "Show me where this came from" is always one click away.

**The system asks for attention only when it has something for you to triage.** No dashboards demanding daily check-ins. No closure rituals at engagement end. Cron-driven baselines, on-demand augmentation, scheduled review cadences. The system runs on timers; humans intervene at chosen moments.

**Interpretation has a half-life; facts don't.** Atom content (decisions, commitments, asks, risks, status updates) tiers down through retention but is never erased while operationally relevant. Interpretive content (confidence inferences, momentum reads, stakeholder positioning observations) operational only — never persisted to archive.

---

## 3. Domain Model

### 3.1 The Spine: Value-Anchored Hypotheses

Loom is value-anchored. Hypotheses are the central organising entity. Everything else attaches to them.

**Two-layer hypothesis structure:**

- **Account-level hypotheses** are long-arc bets that span engagements. Example: *"Panasonic becomes a reference account for SAP-on-AWS in Japan-HQ'd manufacturers."* They move slowly and outlast individual SOWs.
- **Engagement-level hypotheses** are proximate bets. Example: *"Wave 2 hits cost outcome,"* *"Wave 2 hits timeline,"* *"Wave 2 establishes foundation for Wave 3."* They validate or threaten the account-level bets above them.

Engagements typically carry 3–7 hypotheses. The number reflects natural fault lines along constraint axes (time, budget, people, scope) — not a target. SaladStop at SGD 150K may have three. Panasonic Wave 2 may have six. The discipline is "however many independent bets exist," not picking a number.

Themes that span accounts (e.g. "Spring of AI unlocks Agentic AI pipeline") emerge through tagging and aggregation across account hypotheses, not as a third layer.

### 3.2 Hypothesis State (Three-Dimensional)

Each hypothesis carries three dimensions of state, evaluated independently:

- **Progress** — where in the lifecycle: *proposed → in-delivery → realised → confirmed → dead.* Evidence-sovereign. Transitions are themselves events with timestamp, attached atoms, and audit trail. This is fact.
- **Confidence** — how solid is the supporting evidence: *low / medium / high.* Interpretive. Inferred from evidence, surfaced for review, never load-bearing without human sign-off. Carries a "last reviewed" timestamp; staleness is visible.
- **Momentum** — leading indicator: *accelerating / steady / slowing / stalled.* Interpretive. Captures the "everything's fine but going quiet" signal. Same review semantics as confidence.

Tuesday-morning view renders progress as fact, confidence and momentum as opinion clearly labeled and time-stamped. Inferred-but-unreviewed states are visibly marked.

### 3.3 Events

Events are the journal: immutable, time-stamped, source-tagged. Once written, never edited. They are the source of truth from which all hypothesis state is derived.

Event types:
- Meetings (Teams transcripts, dictated meeting notes)
- Email threads or excerpts
- Dictated quick notes
- Typed quick notes
- Hypothesis state-change events (themselves first-class events with their own provenance)

Events are extracted from inbox content by the processor. They carry source metadata (where they came from, when they happened, who was present where applicable) and link to the original artifact.

### 3.4 Atoms (B-Model: Meeting as Wrapper, Atoms as Structured Children)

Within meeting events, the processor extracts five types of atomic facts. Atoms are addressable, lifecycle-bearing, and inherit context from their enclosing meeting.

**v1 atom set:**

1. **Decision** — a determination made. *"We will prioritise Wave 2 over the new Greenfield ask."*
2. **Commitment** — something owed *by* someone. *"Madhavan to socialise the budget with the steering committee by Apr 26."* Has owner, due date, status, slippage history.
3. **Ask** — something owed *to* someone (commitment with owner-direction inverted). *"AWS to confirm Spring of AI validation by end of May."* Tracked separately because the lifecycle and intervention pattern differs.
4. **Risk** — a tracked threat with severity, owner, mitigation status.
5. **Status update** — a reported state of something (delivery progress, stakeholder mood, external development) that doesn't fit the above.

Atoms are extracted recall-favouring. Confidence/sort-key field exists so triage can prioritise, but extraction itself does not gate.

### 3.5 Stakeholders (Global Entities)

Stakeholders are first-class entities, scoped globally rather than per-engagement. Madhavan exists once; he is an internal advocate on the Panasonic Wave 2 engagement and a node on the Panasonic-as-reference-account hypothesis. Desiree Low (AWS) shows up across SMART, Five Star, and the PBP.

Stakeholders attach to hypotheses with role labels: sponsor, beneficiary, blocker, validator, internal advocate, external advocate, doer, influencer.

Entity resolution (is this Madhavan the same as that Madhavan?) is a known cost of global scoping; handled at processor time, with a stakeholder review queue when inference is uncertain.

### 3.6 Provenance

Every state-bearing fact links back through atoms to source events to source artifacts. Concretely:

- A hypothesis's progress state links to the state-change events that produced it.
- A state-change event links to the atoms that triggered it.
- An atom links to the meeting event that contains it, and to the specific transcript paragraph or message excerpt where it was said.
- A meeting event links to the source artifact (full Teams transcript, dictation file, email thread).

The MCP server exposes provenance dereferencing as a first-class tool. When Claude says "Thee Jay raised a budget concern," asking "show me" returns the actual exchange.

---

## 4. Architecture

### 4.1 Storage Layout

**Inbox (Obsidian, iCloud-synced):** Mobile-accessible rough draft area. Captures dictation, quick notes, forwarded email excerpts. Single folder; processor handles routing internally. Phone capture stays dumb.

**Processor (Mac, scheduled):** Cron-driven pipeline. Reads inbox, sniffs content type, extracts events and atoms, writes to structured store, generates outbox projections. Also pulls Teams transcripts via the existing `outlook-mcp` Teams tools.

**Structured store (Mac, local):** SQLite or DuckDB. Holds events, atoms, hypotheses, stakeholders, state, provenance links. Mac-resident only — never on iCloud. The MCP server is the only writer.

**Outbox (Obsidian, iCloud-synced):** Projection of structured store as markdown. Engagement briefs, account briefs, hypothesis pages, stakeholder pages. Regenerated by processor on schedule. Read-only from Obsidian's perspective. Serves as the fallback surface and as Claude's read input.

### 4.2 Why This Split

iCloud reliably syncs markdown. iCloud does not reliably sync SQLite (file locking, partial syncs, corruption). Therefore the structured store stays Mac-resident, and markdown is the sync medium for both inbox (input) and outbox (output). The phone never touches the database.

This architecture also means no custom iOS app is needed. Obsidian Mobile + iCloud handles capture and fallback reading. The system meets the user where they already work.

### 4.3 Latency Profile

iCloud sync latency is variable — typically minutes, occasionally hours when the phone has been off-network. Architecture cannot beat physics. The system is designed for an end-of-day or weekly triage rhythm, not "I dictated something in the cab and need it processed before this meeting." A manual push trigger from the phone can be added but does not eliminate the inherent latency floor.

---

## 5. Inputs and Routing

### 5.1 Input Types (v1)

1. **Teams transcripts** — already structured (speaker-attributed, timestamped, calendar-linked). Pulled via existing `outlook-mcp` Teams tools. Highest fidelity input.
2. **Dictated notes** — unstructured prose. Captured via iPhone dictation into Obsidian Mobile. No speaker attribution.
3. **Email threads or excerpts** — semi-structured (sender, date, subject). Forwarded or pasted.
4. **Typed quick notes** — keyboard capture on Mac or phone. Often messiest.

### 5.2 Routing Strategy: Content-Sniffed with Feedback (Option C)

Single inbox folder. Processor detects type and routes internally to the appropriate parser. Phone capture stays dumb.

The sniffer exposes confidence. High-confidence routing happens silently. Low-confidence routing flags itself for review at triage time. Misroutes are first-class data, stored with original content and corrected route, feeding rule refinement or future model retraining.

Ambiguous-by-nature items (a "quick note" that's actually a commitment from a hallway conversation) need a "this is more than one type" path so information isn't lost at routing.

### 5.3 Extraction Strategy: Recall-Favouring with Feedback (Option A)

The processor errs toward extracting more atoms rather than fewer. A typical hour-long meeting may yield 15–30 candidate atoms in v1; many will be noise. Triage carries the cleanup cost.

Dismissed atoms persist as structured negative examples — *"this was extracted as a commitment but isn't"* — feeding future precision improvement. Atoms carry a confidence/sort-key field so triage prioritises ambiguous ones for attention while high-confidence ones triage in seconds.

---

## 6. Hypothesis Attachment and State Transitions

### 6.1 Attachment Model: Hypothesis-First (Option D)

Events arrive unattached. The default state of an event in the structured store is *unattached to any hypothesis.* Attachment happens through human triage on a regular cadence.

The triage flow:

1. User visits a hypothesis.
2. The system surfaces candidate events from the time window since last review, ranked by plausible relevance to *that specific hypothesis*.
3. User triages each candidate: attach / dismiss as not relevant / defer / attach with ambiguity flag.
4. Dismissals are first-class data, captured as training signal for future automated proposals.

This inverts the failure mode of process-anchored systems where the firehose of activity sets the agenda. Here, the hypothesis sets the agenda; activity is evaluated against it.

Cadence: weekly for engagement hypotheses, biweekly or monthly for account hypotheses. The system is opinionated about *when* to surface what.

Future evolution: once enough corrections have accumulated, automated attachment proposals (Option B layered on top of D) can shift weight toward inference. Corrections become the labeled training data.

### 6.2 State Transitions: Inferred with Review (Option C)

The system reads attached events and proposes hypothesis state changes with reasoning. Example: *"Wave 2 cost-outcome: I'm seeing three slipped commitments and one budget concern raised by Thee Jay; suggesting move from in-delivery/high-confidence to in-delivery/medium-confidence. Reasoning: [linked atoms]."* User confirms or overrides.

Critical UX requirements:

- **The inference shows its working.** Reasoning is the artifact reviewed, not just the proposed new state.
- **Reviewed-and-confirmed is a separate state from inferred-but-unreviewed.** Tuesday view distinguishes them visibly.
- **Override captures the *reason*.** When the user rejects an inference, optional one-line "why" field — *"Thee Jay's concern was performative for an internal audience"* — is the highest-value training signal in the system.

Progress transitions (the evidence dimension) get the strongest provenance treatment. Confidence and momentum (the interpretive dimensions) are inferred more readily but never persisted past their operational window.

---

## 7. The Surface

### 7.1 Use Order (Stated)

1. **Claude (Mac) — primary.** "Brief me on Panasonic Wave 2 for the 10am."
2. **Obsidian Mobile — fallback** when Claude is unavailable.
3. **Obsidian Mac — depth** when detailed analysis is needed.

This order makes the MCP server the primary product. Obsidian is the fallback surface. Briefs must therefore exist as pre-generated artifacts so they're available even when Claude is not.

### 7.2 Brief Shape: Layered (Option B)

Briefs are layered:

- **Top** — executive view: hypothesis state for the engagement's hypotheses with progress/confidence/momentum, three to five most consequential atoms since last review, anything pending review (state transitions to confirm, atoms to triage).
- **Below** — sectioned drill-downs: open commitments by owner, recent decisions, open asks (split by direction), risk register, recent status updates.

The shape serves both the 30-second pre-meeting scan and the 5–10-minute desk pre-read.

### 7.3 Generation Model: Pre-generated + On-demand (Option C)

**Pre-generated baselines** run on schedule and are written to the outbox as markdown. They serve dual duty as the Obsidian fallback. Cadence:

- Weekday 7am: engagement-level briefs for active engagements.
- Sunday evening: account-level briefs.

**On-demand augmentation** happens when Claude is invoked. Claude reads the pre-generated baseline as context and augments it with live data — anything that arrived in the last few hours, plus any specific angle the user is asking about (*"focus on stakeholder confidence"*).

The metaphor: pre-generation is the morning newspaper; on-demand is the wire feed.

### 7.4 MCP Tool Surface

The MCP server exposes roughly seven tools, mapped to the layered brief structure:

1. `get_engagement_brief(name)` — top-layer executive view: hypotheses with three-dimensional state, recent atom counts, pending-review counts. One call, structured response.
2. `get_open_commitments(account_or_engagement, owner=None, days=14)` — filtered atom slice with status, due dates, slippage history.
3. `get_recent_decisions(account_or_engagement, days=14)` — chronological slice with provenance links.
4. `get_open_asks(account_or_engagement, side=None)` — asks by direction (asks-of-AWS, asks-of-customer, asks-of-1CloudHub).
5. `get_risk_register(account_or_engagement)` — current risks with severity and owner.
6. `get_pending_reviews(account_or_engagement)` — anything awaiting triage: state transitions, low-confidence atoms, ambiguous routing.
7. `get_atom_provenance(atom_id)` — returns the source transcript paragraph or email excerpt for a specific atom. Used reactively when the user pushes deeper.

Claude composes the layered output by selecting which tools to call based on the question. Quick brief: tool 1 only. Escalation review: 1 + 2 + 3 + 5 + 6. Steering committee: all of them.

The grain principle: one tool per question you'd actually ask on a Tuesday morning. Not too coarse (one giant `get_engagement` returns everything), not too fine (twenty atomic tools that need chaining). The right grain matches the brief's structure.

---

## 8. Memory and Retention

### 8.1 Tiered Retention for Atom Content (Option C, Compressed)

- **0–6 months:** full fidelity. All atoms queryable. Pre-generated briefs current.
- **6–12 months:** mid-term. Atoms preserved but only summary briefs are pre-generated. Deeper queries trigger reconstruction.
- **12+ months:** archive. Compressed and demoted from the structured store and the on-demand augmentation layer. Still grep-able by Claude on explicit reach-back. Slow path, not lost path.

### 8.2 Interpretation Is Not Retained Long-Term

Interpretive content — confidence inferences, momentum reads, free-text observations about stakeholder positioning — is operational only. It exists to drive the current Tuesday brief. It does not accrete into the archive.

Rationale: human confidence about a relationship six months ago means little today, and retaining inferences about individuals creates liability without strategic value. The system's long-term memory is the engagement's factual ledger, nothing more.

### 8.3 Closure: Passive Retention (Option A)

Engagements close, timers run, atoms tier as scheduled. No closure ritual. The system does not ask for curation at engagement end.

This is consistent with the principle that the system asks for attention only when it has something for the user to triage.

---

## 9. Domain Expansion

Loom's primitives — value as spine, evidence as truth, interpretation as provisional, provenance as structural — are domain-agnostic. The system generalises beyond CRO work because the underlying shape is how serious thinking works regardless of subject.

What changes per domain:

- **Vocabulary** (engagements / projects / portfolios / protocols / theses)
- **Atom types** (some domains may need additional or different atoms)
- **Cadence** of pre-generation and review
- **Read tools** specific to the domain's question patterns
- **Stakeholder model** (some domains have no other people; some have many)
- **Retention rules** (medical and financial may have different legal retention requirements)

The spine is identical: hypotheses with three-dimensional state, atoms with provenance, hypothesis-first triage, recall-favouring extraction with human correction, evidence-sovereign progress.

The sections below are scaffolds to be filled in as requirements clarify for each domain.

### 9.1 Day Job (CRO at 1CloudHub) — Designed Above

This is the domain Loom was designed against. Sections 1–8 above describe it.

### 9.2 Machine in the Loop (Content Practice)

**Purpose:** capture and develop the editorial thinking behind the *Machine in the Loop* content practice — adoption-gap thesis, POC-to-production, ROI-as-adoption pillars — and the publishing workflow.

Open questions to flesh out:
- What's the hypothesis structure? Is each pillar a hypothesis? Each post a sub-hypothesis? Or is the unit of value something else (e.g. a perspective shift in a target reader)?
- What are the atoms? Editorial decisions, framing choices, evidence references, audience signals?
- What is the brief equivalent? Sunday batching session prep? Weekly editorial review?
- What inputs does the processor handle? Superwhisper/dictation? Web clippings? Engagement metrics from LinkedIn?
- Retention: do failed drafts retain, or sunset?

### 9.3 Coding Documentation Store

**Purpose:** capture decisions made during the lifetime of a project — architecture decisions, library choices, trade-offs considered, what was rejected and why.

Open questions to flesh out:
- Project as the unit (analogous to engagement) and architectural goals as hypotheses (e.g. "this service stays under 500ms p99 latency")?
- Atom set: is the v1 set (decision, commitment, ask, risk, status update) sufficient, or do we need ADR-specific atoms (alternative-considered, trade-off-accepted)?
- Inputs: commits, PR descriptions, code review threads, architecture meeting transcripts, scratch design notes?
- Brief: project status for picking up after a context switch? Architectural retrospective?
- Provenance: link atoms to specific commits / PRs / files?
- Retention: long-term, since coding decisions often need to be revisited years later — this domain may want longer or different tiers.

### 9.4 Teaching Notes for the Team

**Purpose:** convert meeting moments and learnings into structured teaching material for the SEA team.

Open questions to flesh out:
- Hypotheses about what skills or instincts the team needs to internalise?
- Atom types: lesson, anti-pattern, exemplar, generalisable principle?
- Inputs: own meeting transcripts (where the lesson was lived), team meeting transcripts, post-mortem notes?
- Brief: weekly teaching notes for distribution? Skill-development snapshots per team member?
- Stakeholders: team members as first-class entities tracked over development arcs?
- Privacy: how are individual team members' development arcs handled with respect to retention and access?

### 9.5 Personal Finance and Investment Decisions

**Purpose:** track investment theses, the research that supported them, and how they aged.

Open questions to flesh out:
- Hypothesis structure: each investment as an engagement, with hypotheses about return / time horizon / risk thesis?
- Or portfolio-level hypotheses (allocation strategy) with individual investments as engagements?
- Atom types: research finding, decision rationale, hypothesis update, exit trigger?
- Inputs: research notes, news clippings, dictated reasoning, periodic review notes?
- Brief: portfolio review on a defined cadence? Position-level when reviewing a specific holding?
- Retention: probably long-term — multi-year arcs are normal.
- Legal retention: tax-relevant decisions may have statutory retention requirements (Singapore: typically 5 years).

### 9.6 Health and Medical Tracking

**Purpose:** track health metrics, medical decisions, interventions tried, and how they aged.

Open questions to flesh out:
- Hypothesis structure: interventions as hypotheses with measured outcomes as evidence?
- Atom types: measurement, prescription, side-effect observation, doctor recommendation, behavioural commitment?
- Inputs: dictated post-appointment notes, lab result imports, manual measurements, wearable data?
- Brief: pre-appointment briefs? Periodic health review?
- Retention: long-term, with very strict access discipline.
- Privacy: this domain has the highest sensitivity. Likely needs encrypted-at-rest storage and explicit access controls separate from the rest of Loom.

### 9.7 Personal Commitments

**Purpose:** track personal commitments — to self, family, friends — alongside the work commitments tracked above.

Open questions to flesh out:
- Same atom set as work, or simpler?
- Hypothesis structure: probably looser — personal commitments are often standalone rather than serving a strategic bet.
- Inputs: dictation, quick notes, calendar entries?
- Privacy: separation from work surface — these should not appear in work briefs.

---

## 10. Open Architectural Questions

These were not resolved in the design conversation and should be addressed before or during build.

- **Database choice.** SQLite vs. DuckDB vs. another local store. SQLite is simpler and battle-tested; DuckDB is better for analytical queries that aggregate over time.
- **Processor language.** The existing `outlook-mcp` is TypeScript/Node. The MCPVault server is Node. Continuity argues for Node. But Python has stronger NLP/LLM library support for the extractors.
- **Stakeholder entity resolution.** Strategy for handling "is this Madhavan the same as that Madhavan?" — fuzzy matching, manual confirmation queue, deterministic identity from email addresses where available?
- **Multi-domain isolation.** Single Loom instance for all domains, or separate instances? If single, how is access controlled (e.g. health domain isolated from work briefs)?
- **MCP server discovery and naming.** What's the server registered as in `claude_desktop_config.json`? `loom`? `loom-fabric`?
- **Backup and disaster recovery.** Mac-resident structured store needs a backup strategy. Time Machine plus optional cloud snapshot of the markdown outbox should suffice but warrants explicit design.
- **Migration from current state.** Existing notes, transcripts, account information — does any of it import into Loom at v1, or does Loom start empty and accrete forward?

---

## 11. The Behavioural Layer

The biggest risk to Loom is not technical. It is behavioural. The hypothesis-first triage model demands a weekly cadence. The recall-favouring extraction puts large triage queues in front of the user. If those rituals do not take root, the system silts up and the briefs degrade.

Designing the ritual is part of the design. To be addressed:

- When does triage run? Block on the calendar? End-of-day on a specific day? Monday morning before the work week starts?
- How long does it take? Target time-per-engagement-per-week. If this is not bounded, the ritual will fail.
- What happens when a week is skipped? Does the queue compound? Does the system surface "you are two weeks behind on Panasonic"?
- What's the minimum viable triage? When time is short, what's the smallest meaningful pass?

These are real design questions, not afterthoughts. They will determine whether Loom becomes load-bearing or becomes another archive of good intentions.

---

## 12. What Loom Is Not

Worth stating to keep the design honest.

- **Loom is not a CRM.** No deal stage progression, no quota tracking, no commission engine. It tracks value hypotheses and the evidence around them.
- **Loom is not a project management tool.** It does not run sprints, assign tickets, or track velocity.
- **Loom is not a notes app.** Obsidian is the notes app. Loom uses Obsidian as the fallback surface and the iCloud sync substrate.
- **Loom is not a database with a chat interface.** The MCP server is the briefing officer; the structured store is the briefing officer's clipboard. The user does not query the database — they ask questions and receive briefings.
- **Loom is not autonomous.** It proposes, it surfaces, it summarises. It does not decide. State changes that move strategy require human sign-off, every time.

---

*End of v0.1.*
