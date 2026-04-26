# Loom — Code / Coding Projects Projection

**Domain:** code
**Author:** Phani
**Version:** 0.1 · April 2026
**References:** `loom-blueprint.md` v0.2

---

## 0. About This Document

This is the **code-domain projection** of Loom — the substrate behind coding projects of any non-trivial scope, from personal tools to client systems. Loom itself is the canonical worked example. Every illustrative hypothesis, atom, and ritual decision in this document is drawn from how Loom would track its own development.

The unit of value in this domain is **the project's promise kept over time** — the code does what it claims, remains maintainable, and the reasoning behind every consequential choice is recoverable years later. Pieces of code are tactical. Decisions, trade-offs, and lessons are the long-arc spine.

This domain has a distinctive shape compared to CRO and content. The code itself is the deliverable, decisions persist as code structure (an architectural call today shapes every commit for years), external references are heavy (library docs, GitHub issues, blog posts consulted at decision time), and the time horizon for revisiting reasoning is measured in years rather than weeks. The hardest design question in this projection is not *what* to capture but *when*, because flow state is the enemy of discipline.

This projection fills in the blueprint's slots with code-specific vocabulary, atom set, cadence, and retention rules. It does not redefine blueprint primitives.

---

## 1. Vocabulary

| Blueprint primitive | Code-domain term |
| ------------------- | ---------------- |
| Domain              | Code             |
| Arena               | Project          |
| Engagement          | Effort (feature, refactor, investigation, migration, spike) |
| Process             | Session          |
| Process transcript  | Session capture  |

**Projects** are bounded codebases or systems with their own identity, hypotheses, and lifecycle. Loom is a project. The `outlook-mcp` server is a project. A multi-repo system held together by a shared promise (Loom's MCP server + processor + vault) is one project.

**Efforts** are bounded units of work within a project, sub-typed via tagging (`type:feature`, `type:refactor`, `type:investigation`, `type:migration`, `type:spike`). A "build the v1 MCP server" effort is a feature. "Migrate from SQLite to DuckDB" is a migration. "Why is the processor running 3× slower this week?" is an investigation. A single commit is too small to be an effort; a coordinated set of commits delivering a bounded outcome is.

**Sessions** are creation moments — solo coding, Claude collaboration, design discussions, debugging, code reviews, pair-programming. Their captures are the highest-fidelity raw input for this domain, equivalent to Teams transcripts in CRO or recordings in content.

**Stakeholder role-label extensions** to the universal set:

- **Maintainer** — current owner-of-code for a project or module.
- **Contributor** — anyone whose commits land in the codebase.
- **User** — consumer of the system. May be self (Loom's primary user is its author).
- **Dependency-author** — whose library the project depends on; treated as advisor-by-proxy via docs and release notes.
- **Future-maintainer** — an abstraction equivalent to content's future-self stakeholder. The version of the user (or a successor) reading the codebase in two years. Some decisions are written specifically *for* them.

The future-maintainer is genuinely first-class here. A surprising fraction of consequential code documentation is written for an audience who doesn't yet exist, and naming that audience explicitly clarifies what's worth capturing.

---

## 2. Hypothesis Structure

**Two layers, per the blueprint.**

**Project-level hypotheses** are long-arc bets about what the project is, does, and remains. They move on multi-month or multi-year horizons. Examples for Loom:

- *"Hypothesis-first triage outperforms process-anchored capture for keeping the system load-bearing across years."*
- *"Markdown-as-sync-medium with Mac-resident SQLite (or DuckDB) is robust enough to be the long-term architecture; no cloud database becomes necessary."*
- *"The blueprint-plus-projections decomposition prevents fragmentation as new domains are added."*
- *"Recall-favouring extraction with human feedback reaches usable precision within six months of daily use."*

These are bets about the system's promises. Their progress moves slowly; their confidence and momentum can shift faster as evidence accumulates (a hypothesis is realised when the architecture survives a year of real use; threatened when a corner case repeatedly breaks it).

**Effort-level hypotheses** are proximate bets that validate or threaten project-level bets. Within a "Build the v1 MCP server" effort:

- *"Seven core read tools (per blueprint section 11.4) are the right grain for v1; users won't need to compose more than two for a typical question."*
- *"DuckDB outperforms SQLite for the brief-generation query pattern enough to justify the operational complexity."*
- *"Cron-driven baselines plus on-demand augmentation hits the latency requirements without a real-time pipeline."*
- *"TypeScript/Node continuity with `outlook-mcp` outweighs Python's NLP advantages for the extractor."*

Within an investigation effort ("Why is the Sunday brief generation taking 4× longer this month?"):

- *"The slowdown is in the atom-attachment join, not the markdown rendering."*
- *"The query plan changed because of a recent atom-table size threshold."*

**Sizing.** Efforts typically carry 3–5 hypotheses. Fewer than CRO engagements because the constraint axes are tighter (correctness, performance, maintainability, scope) and outcomes are usually clearer (the benchmark either improves or it doesn't; the abstraction either accommodates the new requirement or it forces a rewrite). The discipline is the same: as many hypotheses as there are independent bets.

**Cross-project themes.** Themes like *agentic-AI-as-collaborator* or *markdown-as-substrate* span multiple projects and emerge through tagging. Surfaced through aggregation across project hypotheses, not as a third structural layer.

---

## 3. Atoms

**Universal atom set (decision, commitment, ask, risk, status update) plus four domain-specific extensions.** This is more extensions than other projections; each is justified below.

Notes on universal atoms in this domain:

- **Decisions** are heavy. ADR-style. Often paired with `alternative-considered` atoms that record what was on the table but not chosen. Decisions in code persist as code structure, so their provenance must reach all the way to specific commits / files / lines where they manifest.
- **Commitments** are less spine-heavy than CRO. *"I'll add tests before merging"* matters but is short-lived and usually self-directed. Direction conventions: self-to-self (most), self-to-collaborator, self-to-user (a fix promised in a release).
- **Asks** are usually external — waiting on a library bug fix, a PR review, a user clarification, a benchmark result.
- **Risks** are technical debt, security concerns, scaling concerns, dependency concerns. Higher in number than CRO because the risk landscape is broader and more granular.
- **Status updates** are heavy: build state changes, benchmark deltas, dependency news (CVE announcements, breaking changes in upstream libraries, EOL declarations).

**Domain-specific atom types:**

- **Alternative-considered** — an option that was on the table at decision time but not taken, with its reasoning. Lifecycle: dormant, but can be promoted to a real decision if context shifts ("we ruled out Postgres at 100 users; we should revisit at 10,000"). Provenance attaches to the parent decision and to the source where the alternative was evaluated. Distinct from a decision because the lifecycle differs — alternatives carry a "still ruled out?" review semantics that decisions don't.
- **Trade-off-accepted** — explicit acknowledgement of a known cost taken on. *"We accepted N+1 queries in the brief-generation path because the abstraction it would take to avoid them isn't worth the complexity at current scale; revisit at 10× current volume."* Lifecycle: must-revisit cadence (each trade-off carries a revisit trigger — a metric threshold, a calendar date, a dependent feature). Distinct from a risk because a risk is a tracked threat with mitigation; a trade-off is a deliberate accepted cost that needs periodic re-evaluation.
- **Research-finding** — a benchmark result, a library evaluation, a citation, a stack-overflow answer used as evidence in a decision. Reusable across decisions. Same shape as the content/finance research-finding atom. Carries a freshness state (*current / aging / stale*) because library landscapes change quickly; a 2024 benchmark of two ORMs may not reflect 2026 reality.
- **Lesson** — generalisable knowledge surfaced from a debugging session, a post-mortem, a working-it-out conversation with Claude. Crosses projects. *"When SQLite lock errors appear in production, check for cross-process writers before optimising the query."* Lifecycle: feeds future decisions, persists indefinitely, surfaces during related decisions in any project. Distinct from research-finding because lessons are first-person earned and from status update because their operational half-life is decades.

**Considered and rejected for v1:**

- **Invariant** as an atom type — a property the system promises to preserve (e.g., *"the structured store is never written by anything except the MCP server"*). Folded into `decision` with an `invariant` tag in v1; promote to first-class atom if a recurring need for invariant-specific tooling emerges.
- **Bug** as an atom type — captured as a risk transitioning to resolved when fixed, with provenance to the commit that resolved it. Adding a `bug` atom type duplicates lifecycle without adding distinct shape.
- **TODO** as an atom type — captured as a commitment when self-directed and meaningful, ignored when it's just a code comment marker. Code comments themselves are not atoms; they're part of the source content that atoms point to.

**Extraction is recall-favouring,** consistent with the blueprint. Decisions and trade-offs especially benefit from generous extraction — the cost of dismissing a non-decision is low; the cost of missing a real one is high and surfaces years later when the question *"why did we do this?"* has no answer.

**Atom-to-code provenance is mandatory and stricter here than other domains.** A decision atom must point to the specific commits, files, or lines where it manifests in code. A trade-off-accepted atom must point to the code that embodies the accepted cost. This is what makes Loom different from a journal — the link between *the decision* and *the code that is the decision* is structural, not narrative.

---

## 4. Events

**Universal event types in use:**

- **Process events:** design sessions (often Claude-collaborated), coding sessions, code reviews, debugging sessions, pair-programming sessions, post-mortems. Captured via Claude conversation exports, dictated post-session notes, recorded session transcripts where available.
- **Inbox-derived events:** dictations, quick notes, on-the-go ideas between sessions.
- **Hypothesis state-change events:** project-level and effort-level shifts, both first-class, both with full provenance to the atoms that produced the transition.
- **Research events:** Claude-generated investigations (library comparisons, benchmark studies, prior-art searches, "what do other systems do" surveys). Heavy use in this domain.
- **Publication events:** releases — tagged versions, deploys, public announcements. Reference the artifact (release notes notebook) and the underlying commits.
- **External-reference events:** library docs consulted, GitHub issues read, blog posts cited, papers referenced. Heavy use; live link plus snapshot is the operative pattern.

**Domain-specific event types:**

- **Commit event** — first-class. References the commit hash, author, message, files changed. Auto-imported from git on a configurable cadence (per project; default hourly during active development). Distinct from a process event because a commit is not a session — it's an artifact of one. The session is where reasoning happened; the commit is where reasoning crystallised into code.
- **PR event** — opened, reviewed, merged, closed. Carries the PR description and review threads as attached content. For solo projects, PRs are often skipped in favour of direct commits; the system shouldn't assume their presence.
- **Build event** — CI run results, especially failures that trigger investigation. Also benchmark runs where the result is operationally interesting (delta beyond noise threshold).
- **Deploy event** — production release or environment promotion. Often coincides with a publication event; sometimes distinct (a deploy may roll out an existing release to new infrastructure without a new publication).
- **Issue event** — bug report or feature request, whether from self, users, or collaborators. Generates atoms (commitments to fix, research findings during diagnosis, decisions during prioritisation).

**Note on Claude collaboration sessions.** A Claude conversation that produces a structured finding (a comparative library evaluation, a debugging investigation that lands on a root cause) is a **research event**, written directly to the structured store with the conversation export as source. A Claude conversation that's exploratory thinking during coding is a **session event** (process event). The distinction is intent at session end, captured at save time.

The blueprint principle that artifacts are mutable workspaces applies heavily here. A design notebook for Loom's MCP server schema is an artifact — it evolves through versions, may fork into "schema v1" and "schema v2 (proposed)" branches, generates publication events when its decisions land in code.

---

## 5. Stakeholder Model

**Stakeholders in this domain are predominantly self for personal projects, with named individuals as a secondary layer for team or open-source projects, and the future-maintainer as a stable abstraction across both.**

For Loom specifically, the stakeholder set is small:

- **Self (current)** — the primary user and maintainer.
- **Self (future-maintainer abstraction)** — explicitly tracked. Some artifacts (the blueprint itself, ADRs for non-obvious architectural choices) are written specifically for this audience.
- **Claude (as collaborator)** — handled as a capability, not a stakeholder, in v1. Claude doesn't carry stable identity, role labels, or hypothesis attachment across sessions in the way a stakeholder does. Promote to stakeholder if multi-session Claude memory becomes load-bearing in a way that warrants tracking it.

For team or OSS projects, the set expands:

- **Maintainer** — current owner-of-code for the project or specific modules.
- **Contributor** — anyone whose commits land. Auto-resolved via git author email; promoted to first-class stakeholder only when their contributions cross a threshold (recurring, owns a module, raises substantive design points). Drive-by contributors stay as contributor-events without first-class entity bloat.
- **User** — consumer of the system. May be self (Loom), may be a customer (client work), may be the public (OSS).
- **Dependency-author** — typically not a tracked entity but appears as a stakeholder when their decisions materially affect a project (a major library author whose roadmap directly shapes ours). Treated lightly — most dependencies are referenced through their docs and release notes, not as tracked individuals.

**Cross-domain behaviour.** A code contributor may also appear in the work domain (a 1CloudHub colleague reviewing client code) or the personal domain. Same global entity, different role labels per domain, no leakage. A code brief never surfaces deal context about that person; a CRO brief never surfaces their code-review notes.

**Entity resolution.** Lower stakes than CRO for solo projects. For team or OSS projects, git author email + GitHub handle resolves cleanly. Free-text mentions in dictated notes go through the stakeholder review queue per blueprint pattern.

**Sensitive role:** dependency-author. When a dependency-author is tracked (rare), confidence inferences about their roadmap or stability are interpretive content per the blueprint and never persist. *"This library author seems to be losing interest"* is a Tuesday-morning operational read; it does not accrete into long-term memory about that person.

---

## 6. Inputs

| Input type             | Source / handling |
| ---------------------- | ----------------- |
| Process transcripts    | Recordings of design or pair-programming sessions (manual import); Claude conversation exports (saved as session captures, heavy use) |
| Dictated notes         | iPhone dictation into Obsidian Mobile (`inbox/code/`); used heavily for post-debugging-session reflections |
| Email threads/excerpts | Less common than other domains; captured via paste or `outlook-mcp` with snapshot when relevant (e.g., a thread about a dependency's roadmap) |
| Typed quick notes      | Mac or phone keyboard into Obsidian inbox |
| Research events        | Claude-authored research artifacts written directly to structured store — heavy use (library evaluations, benchmark studies, prior-art surveys) |
| External references    | Library docs, GitHub issues, blog posts, papers — live link plus snapshot. The snapshot is critical because URLs decay and packages get yanked |
| Commits                | Auto-pull from git (per-project cadence; default hourly during active development) |
| PR descriptions/threads | Manual paste in v1; git-provider API integration in v2 if value-positive |
| Build/CI logs          | Manual import for failure events that trigger investigation; auto-capture in v2 |
| Benchmark results      | Manual import (results files); auto-capture in v2 once a stable benchmarking harness exists for a project |
| Issue tracker content  | Manual paste in v1; provider API integration in v2 |

**Note on git integration.** Loom polls git, not the other way round. Git remains the source of truth for code; Loom imports commit metadata as events and references commits from atoms. Loom never writes to git. This isolation is structural — the same principle as the structured store never being on iCloud.

**Note on external-reference rot.** Library docs move, blog posts disappear, GitHub issues get deleted, npm packages get unpublished. The live-link-plus-snapshot pattern is more critical here than in any other domain. The snapshot must capture the *finding extracted* with enough context that the atom remains interpretable even when the source vanishes — not just a URL and a quote, but a sentence or two of context about why the finding mattered.

---

## 7. Cadence

**The defining tension of this domain: triage discipline conflicts with flow state.** Coders go heads-down on features for days or weeks. The system must accommodate intensity bursts without silting up.

**Pre-generation:**

- **End-of-session brief refresh:** when the Mac wakes from a >2hr idle on an active project, regenerate that project's brief silently in the background. Catches up after a break without demanding attention.
- **Friday afternoon:** project-level briefs for active projects. Aligns with the weekly triage ritual.
- **Last Sunday of the month:** project review briefs (arena-level), with cross-effort patterns and trade-off revisit prompts.

**Triage:**

- **End-of-coding-session triage** (5 min, after each substantial session): the most important ritual in this domain. Captured while context is hot. Promote any worth-capturing items from the Claude conversation export, the open scratch notes, and the recent commits. See section 11 for sequence.
- **Weekly project triage** (Friday, 15–30 minutes per active project): confirm pending hypothesis-state proposals, triage atoms, dismiss-or-attach unattached events, plan the next week's session focus.
- **Monthly project review** (last Sunday, 30 min per active project): cross-effort patterns, retire dead hypotheses, surface trade-offs due for revisit, promote project-specific lessons to cross-project knowledge.

**Backlog handling — flow-state aware.** A long uninterrupted commit stream with no triage is a *build* (heads-down on a feature), which is a legitimate state. The system distinguishes a build (high commit velocity, focused on a single effort) from silting-up (low velocity, scattered, no triage). When a build is detected, the system suppresses backlog warnings until the build closes — typically signalled by a release, a merge to main, or three consecutive days of no commits. After the build closes, normal backlog handling resumes.

This is a deliberate design call. The alternative — nagging during flow — corrodes the ritual into something resented and skipped entirely. Better to absorb a triage gap during a real build and catch up afterward than to fight the workflow.

**Standard skip handling** (when not in a build): one skip recoverable, two surfaces a top-of-brief warning, three halts state-transition proposals until triage resumes. Same graceful-degradation pattern as CRO and content.

**Minimum viable triage** when time is short: confirm or override pending hypothesis-state proposals only; defer atom triage. Atoms tolerate deferral better than CRO commitments because their operational time-pressure is lower (a week-old decision atom is fine; a week-old slipped commitment to a customer is not).

---

## 8. Read Tools

**Universal blueprint tools applicable, with `domain="code"`:**

1. `get_engagement_brief("code", effort_name)` — effort-level executive view
2. `get_arena_brief("code", project_name)` — project-level brief
3. `get_open_commitments("code", scope, days=14)` — usually self-directed; less spine-heavy than other domains
4. `get_recent_decisions("code", scope, days=14)` — paired with alternatives-considered for ADR-style read
5. `get_open_asks("code", scope)` — typically external (waiting on library fixes, reviews)
6. `get_risk_register("code", scope)` — technical debt, security, scaling, dependency risks
7. `get_pending_reviews("code", scope)` — hypothesis-state proposals, ambiguous routings, trade-offs due for revisit
8. `get_atom_provenance(atom_id)` — universal; in this domain, returns commits / files / lines as well as session transcripts
9. `get_notebook(name)` / `write_to_notebook(name, content, version_intent)` — universal, heavily used

**Domain-specific read tools:**

- `get_project_status(name)` — the "picking up after a context switch" tool. Returns recent commits (since last session on this project), open efforts and their hypothesis state, pending decisions, recently surfaced atoms, and any flagged dependency news. Distinct from `get_arena_brief` because it's tuned for re-entry rather than review — what you need to know to start coding right now.
- `get_decision_log(scope, days=N)` — chronological decisions with their alternatives-considered atoms attached. The ADR view. The unit of return is the decision-with-context, not just the decision text.
- `get_open_trade_offs(scope)` — trade-offs taken on, with their last-reviewed timestamp, their revisit triggers (metric threshold / date / dependent feature), and current status of the trigger. Surfaces *"the trade-off you accepted six months ago is now due for re-evaluation."*
- `get_dependency_health(scope)` — current dependency state, recent CVE alerts, recent breaking-change announcements in upstream libraries, EOL warnings. Composed from external-reference events and status-update atoms.
- `get_lessons(query=None, project_scope=None)` — search across lesson atoms, optionally cross-project. The *"have I learned something about this before?"* tool. Cross-project by default — lessons are most valuable when they surface during a *different* project's similar problem.

**Grain principle preserved.** Each tool answers a question that gets asked in the moment. `get_project_status` exists because *"what was I doing on this project last week?"* is the most common Monday-morning question for any non-trivial codebase.

---

## 9. Retention

**Defaults from the blueprint apply with the following modifications, per the blueprint's note that code retention typically extends:**

- **0–24 months:** full fidelity. All atoms queryable. Pre-generated briefs current.
- **24–60 months:** mid-term. Atoms preserved; only summary briefs pre-generated.
- **60+ months:** archive. Compressed and demoted, but grep-able by Claude on explicit reach-back.

**Retention exceptions (atoms that resist demotion):**

- **Decisions and their alternatives-considered:** never demoted while the project is active. The reasoning behind a decision must be recoverable for the lifetime of the code that embodies it. When a project formally closes (see open questions), decisions and alternatives demote on the standard timeline.
- **Trade-offs:** retain at full fidelity while the trade-off is open. Once retired (the trigger fired and the decision was revisited), demote on the standard timeline.
- **Lessons:** retain at full fidelity indefinitely, even past project closure. Lessons are cross-project knowledge whose value is independent of any one codebase.
- **Research findings:** retain at the same tier as the project they support, with the freshness-state field surfacing staleness in queries (a 2024 ORM benchmark in a 2026 query is flagged stale, not silently used).

**Domain-specific sensitivities:**

- **Client code IP.** A code projection used for client work carries the client's IP boundary. The project sensitivity tag (see section 10) controls retention — client projects may be subject to contractual deletion obligations independent of Loom's defaults.
- **OSS code.** Public anyway. Retention defaults apply; no special handling beyond avoiding accidental disclosure of contributors' private comments.
- **Personal projects.** Default retention.

---

## 10. Privacy Posture

**Domain isolation.** Code briefs never include content from work, finance, health, or personal domains. The reverse is also enforced: working notes from the code domain do not surface in CRO briefs even when they reference the same individual or system.

**Within-domain access.** Single-user system. Per-project access controls deferred to v2.

**Project sensitivity tags.** Each project carries a sensitivity tag — `personal`, `oss`, `client`, `employer` — that affects:

- Cross-domain query auditability (client code touching CRO context requires explicit confirmation)
- Export rules (OSS exports freely; client exports require sensitivity check)
- Retention overrides (client may have contractual deletion clauses)
- Pre-publication review (releases that touch client code surface the IP boundary)

**Sharing.** Loom does not push to git or to package registries. Releases are human-mediated, every time. Drafts of decision documents may be exported as markdown for collaborators or for inclusion in a project's actual repo (an ADR copied from a Loom notebook into the codebase's `/docs/adr/` folder), with provenance stripped.

**Pre-release privacy review.** Before a release event is generated, Loom surfaces:

- Sensitivity-tag mismatch (a release note that references content from a higher-sensitivity project)
- Cross-domain leakage (a release note that inadvertently references a CRO deal context)
- Contributor-attribution accuracy (decisions attributed to contributors are correctly attributed)

Human judgement still decides; this is a checklist, not a gate.

---

## 11. Behavioural Ritual

**The most consequential design decision for this projection's success.** The lever is not more discipline — it is catching the capture moment while context is still hot.

### End-of-session triage (the primary ritual)

After a substantial coding session — typically a session that produced commits, made a non-trivial decision, or hit a debugging insight — a 5-minute pass while the work is still in working memory.

**Sequence:**

1. **Open the session's Claude conversation export** (if applicable) and let the system surface candidate atoms — decisions made, alternatives considered, trade-offs accepted, lessons surfaced.
2. **Confirm or dismiss** each candidate. Five minutes maximum. Recall-favouring extraction means many false positives; that's expected and the dismissal is itself the training signal.
3. **Glance at recent commits** since the last session. The system surfaces commits that look decision-laden (commit messages with `feat:`, `refactor:`, `chore: [decision]` markers, or large multi-file changes); user confirms whether each is worth atomizing.
4. **Capture any open scratch notes** dictated or typed during the session into the inbox if they haven't been saved.
5. **Done.** Close the laptop or move to the next thing.

This ritual is short by design. The cost of skipping it (lost context, decisions that became invisible) is high; the cost of doing it (5 minutes) is low. It must stay short or it will be skipped.

**What gets dropped first when time is short:** scratch-note capture (low-stakes, can be redone). **What's protected:** decision and trade-off atomization (high-stakes, hard to reconstruct later).

### Weekly project triage

Friday afternoon, 15–30 minutes per active project. Heavier than end-of-session because it processes a week's accumulated context.

**Sequence:**

1. **Read the Friday-afternoon project brief.** Pre-generated.
2. **Confirm or override pending hypothesis-state proposals.** Highest priority.
3. **Triage unattached events** (commits, PRs, sessions) against the project's active hypotheses.
4. **Triage atoms** that weren't captured at end-of-session — emails, build failures, dependency news.
5. **Plan the next week's session focus.** Use the brief to identify which efforts advance which hypotheses; surface trade-offs due for revisit.

### Monthly project review

Last Sunday of the month, 30 minutes per active project.

**Purpose:** cross-effort patterns, retire dead hypotheses, surface trade-offs whose revisit triggers fired, promote project-specific lessons to cross-project knowledge, consider new project-level hypotheses if a pattern is emerging.

**Output:** annotated project-level brief ready for Monday morning.

### Skip handling — flow-aware

Flow-state aware backlog handling, per section 7. A build (heads-down on a feature) suppresses backlog warnings until the build closes. Standard graceful degradation outside of builds.

The metaphor: triage is a sweep through the workshop. During a build, the workshop is full of work-in-progress and a sweep would just push things around. After the build, the sweep is productive and the floor needs it.

---

## 12. Risks Specific to This Projection

- **Capture friction during flow.** The single biggest risk in the domain. Mitigation is structural: end-of-session ritual is short by design (5 min); Claude conversation exports do most of the surfacing work; commit messages can carry capture hints (e.g., `[decision: ...]` markers); the flow-state-aware backlog handling means an active build doesn't generate nags. The lever is not asking for more discipline; it is reducing the cost of the capture moment.
- **Documentation theatre.** ADRs written retrospectively for an audience tend to fictionalise reasoning — they're written backwards from the choice, making the path look cleaner than it was. Mitigation: capture during real decision moments (end-of-session, while context is hot), not retrospectively at release time. The blueprint principle that dismissed atoms are first-class data also helps — preserving the alternatives-considered record forces honesty about what was actually on the table.
- **Code-as-truth versus atom-as-truth drift.** When the code says one thing and the atom says another, the code wins — the atom is documentation, the code is the system. But Loom should detect this drift. Mitigation: provenance from atoms to specific commits / files; periodic verification queries (*"this decision atom claims X about file Y; does the current file Y still embody X?"*) surfaced during monthly reviews. Drift detection is a v2 capability, not v1.
- **Cross-sensitivity mixing in exports.** A release note that pulls from notebooks across personal, OSS, and client projects can leak IP. Mitigation: project sensitivity tags + pre-release privacy review (section 10).
- **External-reference rot.** Library docs move, GitHub issues get deleted, blog posts disappear, npm packages get yanked. Mitigation: aggressive snapshot capture (more context than other domains) and the blueprint's mark-as-unverifiable behaviour when the live link fails.
- **Stakeholder bloat in team projects.** Every drive-by contributor becomes noise if auto-promoted to first-class stakeholder. Mitigation: contributor → first-class-stakeholder threshold (recurring contributions, owns a module, raises substantive design points). Drive-bys remain as contributor-events.
- **Trade-off amnesia.** The hardest failure mode. A trade-off accepted six months ago to ship a feature becomes invisible by the time its cost actually bites. Mitigation: trade-offs carry explicit revisit triggers; `get_open_trade_offs` surfaces those due for revisit; monthly project review consciously sweeps trade-offs. The structural promise of this projection is that trade-offs cannot quietly go invisible.
- **Decision proliferation.** Every line of code embodies decisions; only some are worth tracking. Recall-favouring extraction plus disciplined dismissal must do real work here. Mitigation: the dismissal-as-training-signal pattern; over time, the extractor learns which decision-shapes are worth atomizing in this user's projects.
- **The Claude-collaboration session boundary.** A 4-hour Claude conversation may contain three real decisions, twenty exploratory dead-ends, and a hundred lines of natural-language reasoning. Surfacing the right atoms from that session without drowning in noise is hard. Mitigation: recall-favouring extraction with confidence sort-keys; high-confidence atoms triage in seconds, ambiguous ones get attention.

---

## 13. Open Questions Specific to This Projection

- **Project closure semantics.** When does a project formally close in Loom — at last commit? At a deliberate "this is now archive" decision? When does retention begin demoting decisions and trade-offs? Most software is "done" only when retired, and the retirement itself is rarely a clean event.
- **Multi-repo projects.** Loom is one project across multiple repos (the MCP server, the processor, the vault structure). One project entity in Loom, multiple git references, with commit events tagged by repo? Probably yes, but the brief layer needs to handle "show me activity across the project" coherently.
- **Forks (literal git forks, not the Loom artifact concept) of a project.** When a project forks — same project entity with a fork tag, or new project with a parent reference? Probably new-project-with-parent-reference, mirroring the artifact fork model from the blueprint.
- **Granularity of decision versus invariant.** v1 folds invariants into decisions with a tag. If invariants accumulate enough that they need their own tooling (e.g., automated invariant-checking against current code), promote to first-class atom type.
- **Auto-import from git and provider APIs.** Cron-driven git polling is straightforward; GitHub/GitLab API integration for PRs, issues, and reviews requires authentication, rate-limit handling, and per-project setup. When is the integration cost worth it? Trigger condition: when manual paste of PR threads is being skipped, or when the manual capture is bottlenecking the brief layer.
- **Claude-as-collaborator entity status.** v1 treats Claude as a capability rather than a stakeholder. If multi-session Claude memory becomes load-bearing in a way that warrants tracking (e.g., "this Claude project remembers decisions across sessions and its memory-state matters"), promote to a stakeholder-like entity. Currently watching, not designing.
- **Commit-message conventions for atom hints.** A `[decision: ...]` or `[trade-off: ...]` marker in commit messages would let the extractor work harder during end-of-session triage. Worth defining a convention or letting it emerge organically? Lean toward emerge organically; codifying too early constrains the workflow.
- **The Loom self-hosting moment.** Loom's own development is the canonical example for this projection, and Loom will eventually be used to track its own development. There is a circularity question worth surfacing: when does Loom become reliable enough to track its own evolution, and what bootstrapping problem does that pose? (Likely: Loom v1 is tracked in Obsidian-only fallback mode until v1 is itself stable enough to host its own metadata.)
- **Benchmark-as-evidence ergonomics.** Benchmarks produce numbers; numbers are seductive and noisy. How do benchmark results integrate as evidence without colonising interpretive judgement, mirroring the LinkedIn-metrics risk in the content projection? Likely the same answer — manual capture in v1, automation only when the rhythm shows the data is load-bearing.

---

*End of v0.1 code / coding projects projection.*
