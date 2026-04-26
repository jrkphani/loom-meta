# Loom — Core Blueprint

**A personal knowledge fabric for evidence-based, value-anchored thinking across work and life.**

Version 0.2 · April 2026 · Author: Phani

---

## 0. About This Document

This is the **core blueprint** for Loom. It defines the invariant primitives — the structural skeleton that every domain shares.

Loom operates across multiple domains (work, finance, health, content, code, personal). Each domain projects this blueprint through its own vocabulary, atom set, cadence, and retention rules, in a companion document.

**Companion documents:**

- `loom-projection-cro.md` — the CRO / day-job projection (fully specified)
- `loom-projection-template.md` — template for authoring new projections
- (To be authored: `loom-projection-finance.md`, `loom-projection-health.md`, `loom-projection-content.md`, `loom-projection-code.md`, `loom-projection-personal.md`)

The blueprint is the constitution; projections are the bylaws. When tension arises between them, the blueprint wins by default. This protects Loom from fragmenting into six systems sharing a name.

---

## 1. What Loom Is

Loom is a personal knowledge fabric. Not a notes app, not a CRM, not a database — a substrate where events (things that happened), artifacts (workspaces where thinking happens), atoms (extracted facts), and hypotheses (bets being made) interlock with full provenance, so that current state can always be traced back to the evidence that produced it.

The metaphor: a loom weaves fabric from threads. Hypotheses are the warp (lengthwise threads holding structure over time). Events are the weft (the daily crossings). Artifacts are the workshop where new threads are spun. State emerges from the interweaving. Provenance is the integrity of the weave.

Loom is designed around one principle: **evidence is sovereign, interpretation is provisional.** Facts about what was decided or committed are durable and traceable. Inferences about how things are going (confidence, momentum) exist for current operations only and never accrete into long-term memory. The system keeps the minutes, not the hallway conversations.

Loom is Claude-first by surface. The MCP server is the primary product. Obsidian projections are the fallback when Claude is unavailable.

---

## 2. Core Design Principles

These are domain-invariant. Every projection inherits them.

**Evidence first, always.** Progress on any hypothesis is established by evidence (atoms with provenance), never by inference. Inferences (confidence, momentum) are interpretive layers explicitly labeled as such and never load-bearing without human sign-off.

**Recall over precision at every extraction surface.** The system extracts generously and lets human dismissal teach it what's noise. A junior analyst who over-flags and learns from edits becomes excellent in twelve months; one who only raises high-confidence findings stays cautious forever.

**Human correction is the learning signal.** Every interface where ambiguity meets human judgment captures the correction as first-class data. The system improves through use.

**Propose generously, never act silently.** The system suggests; the human confirms. State changes that move strategy never happen without human sign-off. Loom is a briefing officer, not a decision-maker.

**Provenance is structural, not decorative.** Every state-bearing fact links to the source events or artifacts that produced it. Every event links to the source artifact (transcript paragraph, email message ID, dictation file, web page). "Show me where this came from" is always one click away.

**Live link plus extracted snapshot for external sources.** When Loom references content outside itself (web pages, emails in Outlook, git commits), it stores the live reference for navigability *and* a snapshot of the finding extracted, so atoms remain interpretable even when sources disappear.

**The system asks for attention only when it has something to triage.** No dashboards demanding daily check-ins. No closure rituals at engagement end. Cron-driven baselines, on-demand augmentation, scheduled review cadences. The system runs on timers; humans intervene at chosen moments.

**Interpretation has a half-life; facts don't.** Atom content (decisions, commitments, asks, risks, status updates) tiers down through retention but is never erased while operationally relevant. Interpretive content (confidence inferences, momentum reads) is operational only — never persisted to archive.

**Events are immutable. Artifacts are mutable. Atoms are extracted.** This three-way distinction protects the journal's integrity. Events are written once and never edited. Artifacts have version history but evolve. Atoms can be revised through their lifecycle (a commitment can slip, get renegotiated, get met) but their provenance to the source event or artifact is fixed at extraction.

---

## 3. The Structural Hierarchy

Loom organises activity through a four-level hierarchy. The vocabulary at each level varies by domain (defined in projections); the structure is invariant.

**Domain.** A self-contained sphere of activity. Examples: work, finance, health, content, code, personal. Domains are first-class scope on every entity in Loom. Privacy and retention rules can be set per domain.

**Arena.** A logical grouping within a domain. Examples (per projection): accounts (work), portfolios (finance), conditions or fitness goals (health), themes or pillars (content), projects (code), life roles (personal).

**Engagement.** A bounded effort within an arena, with its own scope, hypotheses, and lifecycle. Examples: a delivery wave (work), an investment position (finance), an intervention protocol (health), an essay or talk (content), a feature or refactor (code).

**Hypothesis (two-layer).** Hypotheses live at two levels: **engagement-level** (proximate bets validated by current evidence) and **arena-level** (long-arc bets validated by patterns across engagements). Engagement outcomes roll up to arena hypotheses. Themes that span arenas emerge through tagging and aggregation, not as a third layer.

Hypotheses are **value-anchored** — every hypothesis is a bet about an outcome or objective. Stakeholders and processes attach to hypotheses; they don't anchor the spine.

---

## 4. The Atomic Units

Every domain has three atomic units. They are universal in concept; each projection defines how they manifest.

**Value.** The objectives, ROI, or outcomes the engagement is meant to produce. Hypotheses are the structured form of value — testable, evidence-bearing, lifecycle-bearing.

**Stakeholders.** The people (or audience personas) who care about, contribute to, or are impacted by the engagement. Stakeholders are global entities — the same person may be a stakeholder across multiple domains with different roles in each. A stakeholder may also be an abstraction (an audience persona, a future version of yourself).

Stakeholder roles attach via labels: sponsor, beneficiary, blocker, validator, advocate, doer, influencer, advisor, decision-maker, informed-party. Projections can extend the role vocabulary.

**Processes.** The mechanisms by which work happens and is governed. Examples: meetings (work), portfolio reviews (finance), appointments (health), writing sessions (content), code reviews (code). Processes generate events, which generate atoms.

---

## 5. Hypothesis State (Three-Dimensional)

Each hypothesis carries three independent dimensions of state:

**Progress** — where in the lifecycle: *proposed → in-delivery → realised → confirmed → dead.* Evidence-sovereign. Transitions are themselves first-class events with timestamp, attached atoms, and audit trail. **This is fact.**

**Confidence** — how solid is the supporting evidence: *low / medium / high.* Interpretive. Inferred from evidence, surfaced for review, never load-bearing without human sign-off. Carries a "last reviewed" timestamp; staleness is visible.

**Momentum** — leading indicator: *accelerating / steady / slowing / stalled.* Interpretive. Captures the "everything's fine but going quiet" signal. Same review semantics as confidence.

Read surfaces render progress as fact, confidence and momentum as opinion clearly labeled and time-stamped. Inferred-but-unreviewed states are visibly marked.

---

## 6. Events, Artifacts, Atoms

Three structurally distinct entity classes. The distinction is load-bearing.

### 6.1 Events (Immutable Journal)

Events are the journal: immutable, time-stamped, source-tagged. Once written, never edited. They are the primary source of truth from which hypothesis state is derived.

**Universal event types** (every domain uses these):

- **Process events** — meetings, appointments, sessions, reviews. Domain-specific naming in each projection.
- **Inbox-derived events** — dictated notes, typed quick notes, forwarded excerpts that were processed and structured.
- **Hypothesis state-change events** — first-class events with their own provenance, generated when a hypothesis transitions on any of its three dimensions.
- **Research events** — structured outputs from extended research (typically Claude-generated). Provenance shape includes queries run, sources consulted with timestamps, findings with confidence calibration, and explicit notes on what was *not* found.
- **Publication events** — generated when an artifact reaches the world (an essay published, a talk delivered, a decision committed to). Reference the artifact that produced them.
- **External-reference events** — pointers to external state (git commits, email threads, web pages) with extracted findings stored locally per the live-link-plus-snapshot pattern.

**Projections may add domain-specific event types.** Examples: trade execution events (finance), measurement events (health), code review events (code).

### 6.2 Artifacts (Mutable Workspaces)

Artifacts are workspaces where thinking happens. Mutable, versioned, sometimes forkable, often collaborative between Claude and the human. Artifacts can generate events when they reach the world.

**Universal artifact properties:**

- **Versioning.** Each save is a snapshot. The current state is the working draft; previous states are recoverable.
- **Authorship.** v1 treats authorship as ambient (any artifact may be human-written, Claude-written, or collaborative). May promote to explicit per-version authorship in v2 if patterns warrant.
- **Forking.** An artifact may fork from a parent, retain a parent reference, and evolve independently. Used for multi-audience versions of the same content (technical vs. executive variants of a keynote).
- **Attachment.** Artifacts attach to hypotheses through the same triage flow as events.
- **Type.** v1 uses a single artifact type with type-as-tag (research, brainstorm, draft, decision-record). May promote to typed structures if domain-specific patterns benefit from explicit shape.

**Storage.** Artifacts live in a `notebooks/` root in the Obsidian vault, iCloud-synced. Each artifact is a folder with a `current.md` and a `versions/` subfolder. Version history is structural in the filesystem, not buried in a database — recoverable even if Loom is offline.

### 6.3 Atoms (Extracted Facts)

Atoms are addressable, lifecycle-bearing facts extracted from events or artifacts. Each atom carries provenance back to its source.

**Universal atom set (v1):**

1. **Decision** — a determination made.
2. **Commitment** — something owed *by* someone. Has owner, due date, status, slippage history.
3. **Ask** — something owed *to* someone (commitment with owner-direction inverted). Tracked separately because the lifecycle and intervention pattern differ.
4. **Risk** — a tracked threat with severity, owner, mitigation status.
5. **Status update** — a reported state of something that doesn't fit the above.

**Projections may add domain-specific atom types** when a recurring pattern doesn't fit cleanly into the universal set. Examples (subject to projection-level confirmation): research finding (finance, content), exit trigger (finance), measurement (health), prescription (health), alternative-considered (code).

**Extraction is recall-favouring.** A typical input may yield many candidate atoms; many will be noise. Triage carries the cleanup cost. Dismissed atoms persist as structured negative examples, feeding future precision improvement.

**Atoms carry a confidence/sort-key field.** Not for filtering at extraction (recall-favouring rejects gating) but so triage can prioritise ambiguous atoms while high-confidence atoms triage in seconds.

---

## 7. Provenance

Every state-bearing fact links back through atoms to source events or artifacts to source content.

**Provenance chain (general form):**

- A hypothesis's progress state links to the state-change events that produced it.
- A state-change event links to the atoms that triggered it.
- An atom links to its source (an event, an artifact, or both).
- An event or artifact links to its source content (transcript paragraph, message ID, file, URL, commit).

**External references degrade gracefully.** Provenance pointers (git refs, email message IDs, web URLs) may become unreachable over time (commits get rebased, messages get deleted, pages disappear). The system handles this by:

- Storing the live reference for navigability while it works.
- Storing a brief snapshot of the *finding extracted* so the atom remains interpretable.
- Marking the source as unverifiable when the live reference fails, never fabricating.

**Provenance dereferencing is a first-class MCP tool.** When Claude says "Stakeholder X raised concern Y," asking "show me" returns the actual source — transcript paragraph, email excerpt, web finding, commit message.

---

## 8. Architecture

### 8.1 Storage Layout

**Inbox** (Obsidian, iCloud-synced) — mobile-accessible rough draft area. Captures dictation, quick notes, forwarded excerpts. Per-domain subfolders. Phone capture stays dumb.

**Notebooks** (Obsidian, iCloud-synced) — artifact root. Folder per artifact; `current.md` plus `versions/` subfolder. Per-domain subfolders. Mobile-accessible read-only; edits happen on Mac.

**Processor** (Mac, scheduled) — cron-driven pipeline. Reads inbox, sniffs content type, extracts events and atoms, writes to structured store, generates outbox projections. Pulls Teams transcripts via existing `outlook-mcp` Teams tools. Pulls other domain-specific inputs as projections specify.

**Structured store** (Mac, local) — SQLite or DuckDB. Holds events, artifacts metadata, atoms, hypotheses, stakeholders, state, provenance links, external-reference table. Mac-resident only — never on iCloud. Domain is a first-class column on every entity. The MCP server is the only writer.

**Outbox** (Obsidian, iCloud-synced) — projection of structured store as markdown. Engagement briefs, arena briefs, hypothesis pages, stakeholder pages. Per-domain subfolders. Regenerated by processor on schedule. Read-only from Obsidian's perspective. Serves as the fallback surface and Claude's read input.

**Vault structure (top-level):**

```
loom-vault/
├── inbox/
│   ├── work/
│   ├── finance/
│   ├── health/
│   ├── content/
│   ├── code/
│   └── personal/
├── notebooks/
│   ├── work/
│   ├── finance/
│   └── ...
└── outbox/
    ├── work/
    ├── finance/
    └── ...
```

### 8.2 Why This Split

iCloud reliably syncs markdown. iCloud does not reliably sync SQLite (file locking, partial syncs, corruption). Therefore the structured store stays Mac-resident; markdown is the sync medium for inbox, notebooks, and outbox. The phone never touches the database.

This means no custom iOS app is needed. Obsidian Mobile + iCloud handles capture, drafting, and fallback reading. The system meets the user where they already work.

### 8.3 Domain as First-Class Scope

A single Loom instance serves all domains. Domain is a column on every entity (events, artifacts, atoms, hypotheses, stakeholders) in the structured store, and a top-level folder in the Obsidian vault.

**Privacy is enforced at the query layer.** A work brief never queries health-domain rows. Cross-domain queries are explicit and auditable. Each domain projection declares its own privacy and retention rules.

**Cross-domain stakeholder identity.** A stakeholder entity is global; their role labels are scoped per domain. The same person may be a sponsor in work and a co-investor in finance, with no information leakage between scopes.

### 8.4 Latency Profile

iCloud sync latency is variable — typically minutes, occasionally hours when the phone is off-network. Architecture cannot beat physics. Loom is designed for end-of-day or weekly triage rhythms, not "I dictated something in the cab and need it processed before this meeting." A manual push trigger from the phone can be added but does not eliminate the inherent latency floor.

---

## 9. Inputs and Routing

### 9.1 Universal Input Types (v1)

Every projection works with a subset of these:

1. **Process transcripts** (Teams meetings, recorded sessions). Highest fidelity — already structured.
2. **Dictated notes** — unstructured prose via iPhone dictation into Obsidian Mobile.
3. **Email threads or excerpts** — semi-structured (sender, date, subject). Forwarded or pasted.
4. **Typed quick notes** — keyboard capture. Often messiest.
5. **Direct Claude-authored inputs** — research events written directly to the structured store, bypassing the inbox/sniffer because their type is known at creation.
6. **External reference imports** — git commits, web pages, email message IDs captured via Claude during research, stored per the live-link-plus-snapshot pattern.

Projections specify which input types are operationally relevant and add domain-specific inputs (lab results in health, broker statements in finance, web clippings in content).

### 9.2 Routing Strategy: Content-Sniffed with Feedback

Single inbox folder per domain. Processor detects type and routes internally. Phone capture stays dumb.

The sniffer exposes confidence. High-confidence routing happens silently. Low-confidence routing flags itself for review at triage. Misroutes are first-class data — stored with original content and corrected route — feeding rule refinement and future model retraining.

Ambiguous-by-nature items need a "this is more than one type" path so information isn't lost at routing.

### 9.3 Extraction Strategy: Recall-Favouring with Feedback

Processor errs toward extracting more atoms rather than fewer. Triage carries cleanup cost. Dismissed atoms persist as structured negative examples. Atoms carry a confidence/sort-key field for triage prioritisation, not extraction gating.

---

## 10. Hypothesis Attachment and State Transitions

### 10.1 Attachment Model: Hypothesis-First (Triage Inverted)

Events and artifacts arrive unattached. Default state in the structured store is *unattached to any hypothesis.* Attachment happens through human triage on a regular cadence.

**Triage flow:**

1. User visits a hypothesis.
2. System surfaces candidate events/artifacts from the time window since last review, ranked by plausible relevance to *that specific hypothesis*.
3. User triages each candidate: attach / dismiss as not relevant / defer / attach with ambiguity flag.
4. Dismissals are first-class data, captured as training signal for future automated proposals.

**Cadence varies by projection.** Generally: weekly for engagement-level hypotheses, biweekly or monthly for arena-level hypotheses.

**Future evolution:** once enough corrections accumulate, automated attachment proposals can shift weight toward inference. Corrections become labeled training data.

### 10.2 State Transitions: Inferred with Review

System reads attached events and proposes hypothesis state changes with reasoning. User confirms or overrides.

**Critical UX requirements:**

- **The inference shows its working.** Reasoning is the artifact reviewed, not just the proposed new state.
- **Reviewed-and-confirmed is a separate state from inferred-but-unreviewed.** Read surfaces distinguish them visibly.
- **Override captures the *reason*.** Optional one-line "why" field is the highest-value training signal in the system.

Progress transitions (the evidence dimension) get the strongest provenance treatment. Confidence and momentum (interpretive dimensions) are inferred more readily but never persisted past their operational window.

---

## 11. The Surface

### 11.1 Use Order

1. **Claude (Mac) — primary.** Direct queries to the MCP server.
2. **Obsidian Mobile — fallback** when Claude is unavailable.
3. **Obsidian Mac — depth** when detailed analysis is needed.

The MCP server is the primary product. Obsidian is the fallback surface. Briefs must exist as pre-generated artifacts so they're available even when Claude is not.

### 11.2 Brief Shape: Layered

Briefs are layered:

- **Top** — executive view: hypothesis state with progress/confidence/momentum, three to five most consequential atoms since last review, anything pending review.
- **Below** — sectioned drill-downs: open commitments by owner, recent decisions, open asks (split by direction), risk register, recent status updates, attached artifacts.

Serves the 30-second pre-meeting scan and the 5–10-minute desk pre-read with the same artifact.

### 11.3 Generation Model: Pre-generated + On-demand

**Pre-generated baselines** run on schedule, written to outbox as markdown. Serve dual duty as Obsidian fallback. Cadence per projection.

**On-demand augmentation** happens when Claude is invoked. Reads pre-generated baseline as context, augments with live data and angle-specific synthesis.

The metaphor: pre-generation is the morning newspaper; on-demand is the wire feed.

### 11.4 MCP Tool Surface

The blueprint defines a universal tool surface. Projections may add domain-specific tools.

**Universal tools (v1, ~10):**

1. `get_engagement_brief(domain, name)` — top-layer executive view: hypotheses with three-dimensional state, recent atom counts, pending-review counts.
2. `get_arena_brief(domain, name)` — arena-level view: arena hypotheses, engagement summaries, cross-engagement patterns.
3. `get_open_commitments(domain, scope, owner=None, days=14)` — filtered atom slice with status, due dates, slippage history.
4. `get_recent_decisions(domain, scope, days=14)` — chronological slice with provenance links.
5. `get_open_asks(domain, scope, side=None)` — asks by direction.
6. `get_risk_register(domain, scope)` — current risks with severity and owner.
7. `get_pending_reviews(domain, scope)` — anything awaiting triage: state transitions, low-confidence atoms, ambiguous routing.
8. `get_atom_provenance(atom_id)` — returns source content (transcript paragraph, email excerpt, web finding, commit message).
9. `get_notebook(name, version=current)` — reads artifact contents at a specific version.
10. `write_to_notebook(name, content, version_intent)` — appends or revises an artifact, creating a new version.

**Grain principle:** one tool per question you'd actually ask in the moment. Not too coarse (one giant tool returns everything), not too fine (twenty atomic tools that need chaining).

Claude composes layered output by selecting which tools to call based on the question. Quick brief: tool 1 only. Escalation review: 1, 3, 4, 6, 7. Steering review: all of them.

---

## 12. Memory and Retention

### 12.1 Tiered Retention for Atom Content (Default)

Default tiers, projections may override:

- **0–6 months:** full fidelity. All atoms queryable. Pre-generated briefs current.
- **6–12 months:** mid-term. Atoms preserved; only summary briefs pre-generated. Deeper queries trigger reconstruction.
- **12+ months:** archive. Compressed and demoted from structured store and on-demand augmentation. Still grep-able by Claude on explicit reach-back. Slow path, not lost path.

### 12.2 Domain-Specific Retention

Projections may override the default:

- **Finance** typically extends retention (multi-year arcs are normal; tax-relevant decisions have statutory retention — Singapore IRAS: typically 5 years).
- **Health** typically extends retention with stricter access discipline (encrypted-at-rest; isolated from other domains' read tools).
- **Code** typically extends retention (architectural decisions revisited years later).
- **Content** may shorten retention for abandoned drafts; published artifacts retain at the same tier as their publication events.

### 12.3 Interpretation Is Not Retained Long-Term

Interpretive content — confidence inferences, momentum reads, free-text observations about stakeholder positioning — is operational only. Never accretes into archive.

The system's long-term memory is the engagement's factual ledger, nothing more.

### 12.4 Closure: Passive Retention (Default)

Engagements close, timers run, atoms tier as scheduled. No closure ritual. The system does not ask for curation at engagement end.

Projections may declare exceptions where active curation is warranted (e.g., post-engagement retrospectives in code or work).

### 12.5 Artifact Retention

Artifacts retain by lifecycle outcome:

- Artifacts that produced **publication events** retain at the same tier as the event.
- Artifacts that produced **decisions or atoms** referenced by active hypotheses retain while those hypotheses are active.
- **Abandoned artifacts** (no events generated, no atoms attached, untouched for 90+ days) sunset to summary, then archive on the standard timeline.

---

## 13. Cross-Domain Behaviour

### 13.1 Stakeholders Span Domains

A stakeholder entity is global. Role labels are scoped per domain.

**Example:** an individual who is a *sponsor* in work, an *advisor* in finance, and a *family member* in personal — three role attachments, one entity, no information leakage between domains.

**Entity resolution** is a known cost. Handled at processor time with a stakeholder review queue when inference is uncertain.

### 13.2 Cross-Domain Queries Are Explicit

By default, every read tool is scoped to a single domain. Cross-domain queries (*"what commitments do I have this week across all of life"*) require explicit cross-domain scope and are auditable.

### 13.3 Privacy Boundaries

Each projection declares its privacy posture:

- Domains with sensitive content (health, finance, personal) declare access controls.
- The MCP server enforces scope at the query layer.
- Briefs in one domain never include content from another unless explicitly requested.

---

## 14. The Behavioural Layer

The biggest risk to Loom is not technical. It is behavioural. Hypothesis-first triage demands a regular cadence. Recall-favouring extraction puts large triage queues in front of the user. If the rituals don't take root, the system silts up and briefs degrade.

**Designing the ritual is part of the design.** Each projection should specify:

- When triage runs (calendar block, end-of-day, weekend morning)
- Time-per-engagement-per-week target — must be bounded
- What happens when a cycle is skipped (does the queue compound; does the system surface backlog warnings)
- Minimum viable triage when time is short

These are real design questions, not afterthoughts.

---

## 15. What Loom Is Not

Worth stating to keep the design honest.

- **Loom is not a CRM, project management tool, EHR, portfolio management system, or CMS.** It is the substrate where decisions, evidence, and thinking around those domains live.
- **Loom is not a notes app.** Obsidian is the notes app. Loom uses Obsidian as the fallback surface and the iCloud sync substrate.
- **Loom is not a database with a chat interface.** The MCP server is the briefing officer; the structured store is the briefing officer's clipboard.
- **Loom is not a content cache.** External references (web pages, emails, commits) are referenced and snapshotted-at-finding-level, not duplicated.
- **Loom is not autonomous.** It proposes, surfaces, summarises. State changes that move strategy require human sign-off, every time.

---

## 16. Open Architectural Questions

To be addressed before or during build:

- **Database choice.** SQLite vs. DuckDB. SQLite is simpler and battle-tested; DuckDB is better for analytical queries that aggregate over time.
- **Processor language.** Existing `outlook-mcp` is TypeScript/Node. Continuity argues for Node. Python has stronger NLP/LLM library support for extractors.
- **Stakeholder entity resolution strategy.** Fuzzy matching, manual confirmation queue, deterministic identity from email addresses where available.
- **Per-domain privacy implementation.** Especially for health: encrypted-at-rest? Separate process boundary? Read-tool ACLs?
- **Artifact version storage.** Filesystem snapshots vs. structured diffs. Filesystem is simpler and recoverable; diffs are more efficient at scale.
- **MCP server discovery and naming.** `loom`? `loom-fabric`? Single server vs. per-domain servers?
- **Backup and disaster recovery.** Time Machine plus optional cloud snapshot of markdown surfaces should suffice but warrants explicit design.
- **Migration from current state.** Existing notes, transcripts, account information — what imports at v1, what starts empty.

---

## 17. Authoring New Projections

To add a domain to Loom:

1. Copy `loom-projection-template.md`.
2. Fill in the slots (vocabulary, atoms, stakeholder model, cadence, retention, read tools, behavioural ritual).
3. Reference this blueprint as the source of invariants.
4. Confirm no projection-level decision violates a blueprint principle (if it must, the blueprint changes first, with conscious intent).

The CRO projection (`loom-projection-cro.md`) is the worked example. New projections follow its structure.

---

*End of v0.2 blueprint.*
