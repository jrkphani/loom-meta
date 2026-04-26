# Loom — Personal Finance & Investments Projection

**Domain:** finance
**Author:** Phani
**Version:** 0.1 · April 2026
**References:** `loom-blueprint.md` v0.2

---

## 0. About This Document

This is the **finance-domain projection** of Loom — the substrate behind personal financial decisions and the long-arc investment theses that fund life objectives. It captures the goal-anchored thinking (own a home, fund children's tertiary education, retire on a target real income) and the position-level execution (which instruments, which allocations, which entry/exit rules) that serve those goals.

The unit of value in this domain is **a life objective met under acceptable risk by a target date.** Positions are deployments toward that objective. Goals are the long-arc value commitments. Hypotheses are about which allocations, vehicles, contribution rates, and structural decisions move the probability of meeting the goal.

This projection fills in the blueprint's slots with finance-specific vocabulary, atom set, cadence, and retention rules. It does not redefine blueprint primitives. Singapore-specific context (CPF, SRS, ABSD, IRAS retention) is integrated where structurally relevant.

---

## 1. Vocabulary

| Blueprint primitive | Finance-domain term |
| ------------------- | ------------------- |
| Domain              | Finance             |
| Arena               | Goal                |
| Engagement          | Position (or bounded execution) |
| Process             | Review              |
| Process transcript  | Review record       |

**Goals** are life objectives — house purchase, children's tertiary education, retirement, emergency fund, wealth-building. Each carries its own time horizon, liquidity profile, and acceptable-risk envelope.

**Positions** are persistent deployments toward goals (an ETF holding, a bond ladder, a CPF account, a property). **Bounded executions** (a property purchase, a major rebalance, a tax-optimisation maneuver, an SRS account setup) are also engagements when their lifecycle is bounded by an event rather than a holding period.

**Reviews** are deliberative moments — monthly check-ins, quarterly deep reviews, advisor meetings, annual planning sessions.

**Stakeholder role-label extensions** to the universal set:

- **Co-decision-maker** — typically a spouse or partner. Distinct from *advisor* (external expertise) and from default user attribution. Used when household decisions require joint sign-off.
- **Future-self stakeholder** — the user at a future life-stage (myself at 60, myself at retirement, myself at child's-tertiary year). Per the content projection's precedent. Used because some hypotheses are written explicitly for future-self decision-making (drawdown rules, downsizing triggers).

*Beneficiary* (already universal) is heavily used here for individuals whose life outcomes the goals serve (children, dependents).

---

## 2. Hypothesis Structure

**Two layers, per the blueprint.**

**Goal-level hypotheses** are long-arc bets defending the path to the life objective. They move slowly; their progress horizons are years to decades. Examples:

- *"Singapore private property purchase, freehold-or-leasehold-with-acceptable-tail, by Q4 2027 with 25% down without disrupting other goals."*
- *"Children's tertiary education funded to S$N in real terms by [child's age 18], assuming Singapore primary + international tertiary."*
- *"Retirement corpus produces S$M per month in real terms from age 60 onward, with 95% probability of not running down before age 95."*
- *"Emergency fund maintained at six months household expenses in T-bill or CPF-OA-eligible liquid form."*

**Position-level (or execution-level) hypotheses** are proximate bets that validate or threaten goal-level bets.

Within a wealth-building / retirement portfolio:

- *"VWRA at 70% / Asia-tilt at 20% / Singapore REITs at 10% delivers the retirement target in SGD-real terms with acceptable drawdown."*
- *"SRS contribution at the maximum (S$15,300/year) produces tax savings + compounding that outperforms the after-tax taxable equivalent over 25 years."*
- *"DCA into VWRA monthly outperforms lump-sum-on-dip waiting over a 10-year horizon."*

Within a property-purchase execution:

- *"Single-name purchase by [spouse with no other property] avoids ABSD on [user's existing position]."*
- *"Mortgage rate trajectory makes Q3 2026 a better lock-in window than Q1 2027."*

Within a children's education goal:

- *"S$X/month into international equity ETF over [horizon] funds tertiary by [year]."*
- *"Currency hedging into target-degree currency (GBP / USD / AUD) at year [-3] reduces FX risk against tertiary fees."*

**Sizing.** Goals typically carry 3–5 hypotheses at the position level. Fewer than CRO engagements because the constraint axes are tighter (capital, time, risk tolerance, liquidity), and the binary outcomes (goal met / not met by date) are clearer.

**Cross-goal themes** emerge through tagging — a *behavioural-discipline* meta-theme (don't deviate from DCA on news), a *tax-efficiency* meta-theme (favour SRS / CPF instruments where applicable), a *currency-diversification* meta-theme. Surfaced through aggregation, not as a third structural layer.

---

## 3. Atoms

**Universal atom set plus three domain-specific extensions.**

Notes on universal atoms in this domain:

- **Decisions** are allocation decisions, contribution-rate decisions, vehicle selections, rebalancing actions. Heavily provenance-linked — the source review or research finding is structural.
- **Commitments** carry direction: self-to-self (DCA schedule, contribution adherence), self-to-spouse (joint-decision deadlines), self-to-advisor (information requested). Slippage history matters here — missed contributions are early signals of life-event impact on goal feasibility.
- **Asks** are pending advisor recommendations, broker confirmations, document requests, tax-optimisation queries.
- **Risks** are concentration, currency, liquidity, regulatory, life-event. Each carries severity, owner, mitigation status.
- **Status updates** include market events, position drawdowns or surges, life-event impacts on goals.

**Domain-specific atom types:**

- **Research finding** — a citation, statistic, fund analysis, tax rule, or comparative product evaluation usable as evidence in decisions. Reusable across positions and goals. Provenance to source (paper, prospectus, IRAS publication, advisor note). State field: *fresh / used / stale / retired.* Tax rules and prospectuses warrant retirement when superseded; the retirement reason is captured.
- **Exit trigger** — a pre-committed condition under which a position will be modified or exited. Specifies the position, the condition (price, drawdown, life event, time horizon, regulatory change), the action (sell N%, rebalance to T, hold-and-document), and the rationale. State: *armed / triggered / overridden / disarmed.* When triggered, surfaces immediately for action; when overridden, the override reason is captured. **The override-reason capture is the highest-value training data in this projection** — it documents the gap between the cold-headed pre-commitment and the warm-blooded moment, and surfaces patterns of behavioural deviation across years.
- **Transaction** — actual buy / sell / dividend / contribution / withdrawal / fee. Sourced from broker statements, CPF statements, bank statements (highest fidelity). Carries amount, currency, instrument, timestamp, fees, settlement detail. Distinct from *commitment* (intent) and *decision* (rationale). Transactions are facts; the ledger.

**Considered and rejected for v1:**

- *Position* as an atom — held instead as the engagement itself. Positions persist for years; atoms are point-in-time facts about a position. The position is where they accumulate.
- *Rebalance* as an atom — represented as a bounded execution (engagement) when material, or as a set of decisions and transactions when routine.
- *Goal-progress snapshot* as an atom — instead computed live by the `get_goal_progress` read tool against the transaction ledger. Avoiding the atom keeps the ledger as the single source of truth.

**Extraction is recall-favouring.** Statement imports especially benefit from generous extraction — a small dividend reinvestment may seem trivial in isolation but matters for tax and rebalancing in aggregate.

---

## 4. Events

**Universal event types in use:**

- **Process events:** monthly portfolio reviews, quarterly deep reviews, advisor meetings, household financial-planning sessions, annual tax-filing review. Captured via dictation, written notes, or recorded sessions.
- **Inbox-derived events:** market reactions, position-specific quick notes, research-on-the-go.
- **Hypothesis state-change events:** goal-level shifts (adjusted target date, revised contribution rate) and position-level shifts (thesis confirmed / weakened / dead), both first-class.
- **Research events:** Claude-generated research artifacts — fund deep-dives, tax-optimisation studies, scenario analyses, advisor-recommendation evaluations. Heavy use; research events feed research-finding atoms.
- **Publication events:** rare in this domain. Triggered when a major decision is committed (property purchase executed, retirement portfolio structure finalised, child's-education vehicle established). Marks the planning notebook artifact as having reached a decisive moment.
- **External-reference events:** news articles affecting positions, regulatory updates, fund prospectus changes, IRAS / CPF / MAS publications. Live link plus snapshot.

**Domain-specific event types:**

- **Statement event** — periodic statements imported from brokers, banks, CPF Board, IRAS, insurers. The transactional ledger source; highest-fidelity input for transaction atom extraction. Immutable journal entries — even if the statement is later restated by the source, the original is preserved alongside the correction.
- **Market event** — significant macro events explicitly tagged as relevant to one or more positions or goals (rate decisions, geopolitical shocks, regulatory changes such as ABSD adjustments, CPF rate revisions). Distinct from external-reference events because they are first-class evidence inputs to hypothesis review, not background context.
- **Life event reference** — pointer to events that originate in the personal domain (job change, child birth, illness, household-income shift) but have direct material impact on finance hypotheses. Source-of-truth event lives in the personal domain; the finance domain stores a reference and the implications extracted. Cross-domain by design, governed by the blueprint's cross-domain query rules.

---

## 5. Stakeholder Model

**Stakeholders in this domain are a mix of named individuals (spouse, advisors, beneficiaries) and abstractions (future-self at age N).** Less audience-persona-heavy than content; less external-network-heavy than CRO.

Concrete examples:

- **Co-decision-maker:** spouse or partner. Joint decisions on goals, household budget, major positions.
- **Beneficiaries:** children, parents, dependents whose life outcomes the goals serve.
- **Advisors:** financial advisor, tax advisor (Singapore-licensed for IRAS matters), insurance advisor, banker.
- **Brokers / institutions:** Interactive Brokers, Endowus, CPF Board, IRAS, MAS, banks, insurers — *informed-party* / *facilitator* role labels.
- **Future-self stakeholders:** myself at 60, myself at child's-tertiary year, myself at retirement. Used because some hypotheses are written explicitly for future-self decision-making (drawdown rules, downsizing triggers, bequest sequencing).

**Cross-domain behaviour.** Spouse appears in the personal domain. Children appear here as beneficiaries and in personal as relationships. Advisors may appear in the work domain (rare but possible — e.g., a tax advisor who is also a partner contact). Same global entity; role labels per domain; no information leakage. Per blueprint Section 13.1.

**Entity resolution.** Stakeholders typically resolve cleanly via deliberate creation (spouse, children, advisors are explicitly added rather than inferred). Statement imports use institutional identifiers (broker account numbers, CPF account ID) which resolve deterministically.

**Sensitive role: spouse / co-decision-maker.** When a hypothesis or commitment requires joint sign-off, the system surfaces joint-status and any unresolved disagreement as a triage item. v1 does not give the spouse direct read access to Loom; cross-decision sharing happens via household financial-planning sessions where the user reads from Loom and the conversation produces new dictated review records. v2 design for a household surface is an open question (Section 13).

---

## 6. Inputs

| Input type             | Source / handling |
| ---------------------- | ----------------- |
| Process transcripts    | Dictated portfolio reviews, recorded advisor meetings (with consent), household planning sessions |
| Dictated notes         | Superwhisper into Obsidian Mobile (`inbox/finance/`) — moderate use, heavier around market events |
| Email threads/excerpts | Advisor correspondence, statement notifications, regulatory updates from IRAS / CPF — read live via `outlook-mcp`, atoms extracted, snapshot stored, message ID retained as live link |
| Typed quick notes      | Mac or phone keyboard into Obsidian inbox |
| Research events        | Claude-authored research artifacts — fund deep-dives, tax studies, scenario analyses |
| External references    | News, fund prospectuses, IRAS / CPF / MAS publications — live link plus snapshot |
| Statement imports      | Broker / bank / CPF / SRS / IRAS / insurer statements — paste into inbox in v1 (CSV preferred when available, otherwise text); API integration deferred |
| Quote / price snapshots| For active positions — manual capture during reviews in v1; scheduled scrape in v2 if friction-positive |

**Domain-specific inputs:**

- **Statement imports** are the central evidentiary input. Loom does not connect to broker APIs in v1; statements are pasted into the inbox. The processor extracts transaction atoms with deterministic precision because the source is structured. Original statement source files are preserved in a separate archive (Section 9, Section 13) for IRAS retention.
- **Tax filings** (Singapore Form B, employer IR8A, NOA from IRAS) are imported annually as events. Tax-relevant atoms (capital gains realisations, dividend receipts, SRS contributions, CPF top-ups, tax reliefs claimed) are extracted and tagged for the relevant tax year.

**Email handling.** Statement notifications and advisor correspondence are referenced via `outlook-mcp` rather than duplicated. Original statement attachments are downloaded to the local archive (separate from Loom proper) for IRAS-retention purposes; the *atoms extracted* live in Loom.

**Friction note.** Manual statement pasting is the largest friction point in this projection. Acceptable in v1 because it forces a thoughtful read of each statement; risky long-term because skipped imports mean missed transactions and silent ledger drift. The behavioural ritual (Section 11) absorbs this, and skipped imports surface aggressively at the next review.

---

## 7. Cadence

**Pre-generation:**

- **Last Sunday of each month, 6pm:** monthly portfolio brief for each active goal, plus a consolidated household-finance brief.
- **Quarterly (last Sunday of Mar / Jun / Sep / Dec):** quarterly deep-review brief — performance against goals, drift from target allocations, hypothesis-state proposals.
- **Annually (mid-February, before tax filing):** annual review brief for tax-filing preparation and year-in-review hypothesis confirmation.

**Triage:**

- **Monthly review:** last Sunday, 30–45 minutes total. Confirms hypothesis-state proposals, triages atoms (transactions, decisions, asks), reviews armed exit triggers.
- **Position-level triage:** included in the monthly cadence. ~5–10 minutes per active position.
- **Quarterly deep review:** 90 minutes. Cross-position patterns, drift detection, rebalancing decisions.
- **Annual review:** 2–3 hours, aligned with tax-filing preparation. Comprehensive hypothesis confirmation, retirement of stale research findings, life-event impact assessment.

**Backlog handling.** Standard graceful-degradation. One skipped month is recoverable; two surface a backlog warning; three halt hypothesis-state proposals until triage resumes.

**Critical anti-pattern: daily checking is anti-design.** The system's pre-generation cadence deliberately matches the appropriate review frequency for long-horizon investing. The MCP surface should resist *"give me a daily portfolio update"* with a soft nudge — *"daily checking is not load-bearing for any of your goals; the next review is [date]"* — unless an exit trigger is armed and the user has explicitly requested watch-mode for that trigger.

**Minimum viable triage** when time is short: confirm or override pending hypothesis-state proposals; review armed exit triggers; defer transaction-level triage to the next cycle. Statement imports must not be deferred more than one cycle — data freshness matters more here than in CRO.

---

## 8. Read Tools

**Universal blueprint tools applicable, with `domain="finance"`:**

1. `get_engagement_brief("finance", position_or_execution_name)` — position-level executive view
2. `get_arena_brief("finance", goal_name)` — goal-level brief
3. `get_open_commitments("finance", scope, days=30)` — DCA adherence, planned reviews, advisor follow-ups
4. `get_recent_decisions("finance", scope, days=30)` — allocation decisions, vehicle selections, rebalancing actions
5. `get_open_asks("finance", scope)` — pending advisor recommendations, broker confirmations
6. `get_risk_register("finance", scope)` — concentration, currency, liquidity, regulatory, life-event risks
7. `get_pending_reviews("finance", scope)` — hypothesis-state proposals, exit-trigger evaluations, ambiguous routing
8. `get_atom_provenance(atom_id)` — universal
9. `get_notebook(name)` / `write_to_notebook(name, content, version_intent)` — universal

**Domain-specific read tools:**

- `get_position_state(position_id)` — current quantitative state of a position: holdings, cost basis, unrealised gain/loss, allocation share within the goal. Reads from latest statement event and any subsequent transaction atoms. Returns raw numbers; interpretation happens in the brief layer.
- `get_goal_progress(goal_name)` — quantitative progress against the goal: target value in real terms, current trajectory, projected delivery date under current contribution rate, sensitivity to contribution-rate changes. Surface for the central question: *am I on track.* Always reports projections as ranges, never point estimates.
- `get_armed_exit_triggers(scope=None)` — all currently armed exit triggers with their conditions and current condition-status. **The pre-commitment surface.** Used during reviews and any time the user is tempted to deviate from a plan; surfacing the prior commitment is the mechanism that makes pre-commitment work.
- `get_research_findings("finance", query=None, state=None)` — searches the research-finding atom store, scoped to finance, with optional keyword and state filters. Used during decision-drafting to surface previously-captured tax rules, fund analyses, comparative evaluations.
- `get_tax_year_summary(year)` — aggregates tax-relevant atoms (capital gains, dividends, SRS contributions, CPF top-ups, reliefs claimed) for a specific tax year. Used annually for filing preparation.

**Grain principle preserved.** Each tool answers a question that gets asked in the moment. The exit-triggers tool exists because *"what did I commit to do under this condition"* is a real question at moments of behavioural temptation.

---

## 9. Retention

**Defaults from the blueprint apply with the following modifications:**

- **Tax-relevant atoms and statements:** retained at full fidelity for **5 years** from the relevant tax year, per IRAS retention requirement for Singapore residents. Demoted to mid-term tier only after the statutory window closes. *5 years is a floor, not a ceiling.*
- **Goal-level hypotheses and their state-change events:** retained at full fidelity for the goal's lifetime + 5 years (a goal closed in 2030 retains until 2035). Goal-level reasoning has multi-decade legibility value.
- **Research findings tied to active goals:** retain at full fidelity while the goal is active. Findings in state `retired` (e.g., a tax rule that was superseded) demote to archive immediately on retirement, with the retirement reason captured.
- **Exit triggers:** retained at full fidelity for the position's lifetime + 2 years after position close. Override records (when an armed trigger was disarmed contrary to its rule) preserved indefinitely — they are the system's record of personal behavioural patterns under stress.
- **Transaction atoms:** retained at full fidelity for at least 5 years per IRAS; in practice retained for the position's lifetime + 5 years.
- **Interpretive content** (confidence inferences, momentum reads, market-mood observations) — operational only, never persisted to archive. The blueprint principle is especially protective here: yesterday's read of *"the market feels frothy"* is worse than worthless if retained as evidence.

**Domain-specific sensitivities:**

- **Statutory retention (Singapore IRAS):** typically 5 years. The system enforces this as a floor.
- **Spouse-impacting decisions:** if a position or goal is jointly held, archive-deletion requires joint sign-off. v1 single-user system — handled via human-mediated review when archive-deletion is contemplated.
- **Life-event references:** when a referenced personal-domain event is itself archived or deleted, the finance-domain reference becomes orphaned. Loom marks the reference as `source-archived` and retains the locally-extracted implication.

---

## 10. Privacy Posture

**Domain isolation is the strictest in Loom apart from health.** Finance briefs never include content from work, content, or personal domains. The reverse is enforced just as strictly: a finance position's existence does not surface in a CRO brief, even when the underlying instrument is a public security related to a customer or partner.

**Insider-information firewall.** The most consequential cross-domain risk: the user is a CRO with material non-public information about customers (deal pipelines, technology decisions, financial states). If the user holds positions in publicly-traded customers or partners, an insider-trading concern is regulatorily live. Loom enforces an explicit firewall:

- Positions are tagged with their underlying instrument's issuer.
- The MCP surface refuses to compose a brief that joins a finance position with a work-domain account whose ticker matches.
- The user is surfaced a periodic warning (annually, or on any new position acquisition) listing finance positions whose issuers overlap with active work-domain accounts.

This is not a substitute for the user's own discipline — it's a structural defense against accidental joining and an audit trail if scrutiny ever arrives.

**Within-domain access.** Single-user system. Spouse-shared content surfaces during household planning sessions through the user reading from Loom; no direct spouse access to the MCP surface in v1.

**Sharing.** Tax-filing exports are explicit, manual, and annual. Advisor briefings are exported on demand (read-only markdown). Loom does not auto-share. The hand-off from Loom-private to advisor-or-spouse-visible is human-mediated, every time.

**Encryption posture.** v1 reuses Loom's standard storage. Finance-specific encryption-at-rest is an open question (Section 13) — comparable in sensitivity to health, but distinct in that statement source-files are already retained in a separate archive for IRAS compliance, which itself needs a defined encryption posture.

---

## 11. Behavioural Ritual

**The monthly review is the operative ritual. The quarterly deep review is the structural ritual. The annual review is the legibility ritual. All three are protected.**

The behavioural-finance frame is the load-bearing design here. Pre-commitment, daily-checking abstinence, and override-reason capture are the structural defenses against the patterns that reliably erode individual returns.

**Monthly review (last Sunday of the month, 6pm, 30–45 minutes):**

1. Open Loom on Mac. Read the pre-generated monthly brief for each active goal and the consolidated household brief.
2. **Statement-import sweep.** Paste any statements not yet imported. The processor extracts transaction atoms; user confirms or corrects.
3. **Goal-level state review (10–15 min total).** Confirm or override goal-level hypothesis-state proposals. Note any life-event signals affecting feasibility.
4. **Position-level triage (5–10 min per active position).** Confirm or override position-level state proposals. Triage decisions, transactions, asks captured during the month.
5. **Exit-trigger review.** For each armed trigger: is the condition being approached? Should the trigger be disarmed (with reason) or held? Are new triggers warranted given the month's evidence?
6. **Inbox sweep.** Dismiss-or-attach unattached events from the month.

**Quarterly deep review (last Sunday of Mar / Jun / Sep / Dec, 90 minutes):**

1. Run the monthly review as above.
2. **Allocation drift assessment.** Compare current allocation to the goal-level target. Decide rebalance / hold / let-it-run; capture the decision and rationale.
3. **Cross-goal interactions.** Identify where progress on one goal threatens another (property down-payment timing vs. retirement contribution rate; education contribution vs. emergency fund replenishment).
4. **Research-finding curation.** Retire stale findings; promote fresh findings; tag any worth deeper development as a Claude research event.

**Annual review (mid-February, 2–3 hours):**

1. Run the monthly review as above.
2. **Tax-year summary review.** Use `get_tax_year_summary` for the prior calendar year. Confirm completeness against personal records before tax filing.
3. **Goal trajectory review.** For each active goal, confirm or revise target, timeline, contribution rate. Material life-event references from the personal domain feed this review.
4. **Hypothesis ledger review.** Review every active hypothesis at goal level. Confirm, revise, or retire. The annual review is the moment to formally close hypotheses that have aged out without resolution.

**Time budgets are protected.** Reviews can run over with explicit acknowledgement; they should not run *under* the budget for the sake of efficiency. The most common failure mode in personal finance is *not investing enough time in deliberation;* the second is *over-checking.* Loom is designed against both.

**What gets dropped first when time is short:** transaction-level triage (deferred one cycle is acceptable). **Protected:** goal-level state confirmation, exit-trigger review, hypothesis-state proposals. **Always done:** statement-import sweep — data freshness is foundational here.

**Daily-checking abstinence.** The user does not visit Loom's finance surface daily, weekly, or even fortnightly except for armed-trigger watch-mode. The system's pre-generation cadence is monthly because that is the appropriate decision-making frequency for long-horizon goals. The behavioural risk of more frequent checking is documented (Section 12) and structurally suppressed.

**Skip handling.** Standard pattern. One skipped month is recoverable; two surfaces a warning; three halts state-transition proposals. Skipped statement imports are flagged separately and more severely — *"two months without a statement import on Account X; transaction record may be incomplete."*

---

## 12. Risks Specific to This Projection

- **Behavioural bias gravity.** Loss aversion, recency bias, FOMO, anchoring — these are the binding constraints on individual investing returns. Loom's structural defenses: pre-committed exit triggers; brief-layer surfacing of prior thesis when current decisions deviate; daily-checking abstinence; override-reason capture. None is sufficient alone; together they create friction against impulse.
- **The over-checking trap.** The system itself can become the mechanism of harm — a "check Loom" habit that converges on daily portfolio polling. *Mitigation:* monthly pre-generation cadence is the deliberate floor; the surface returns *"no material change since last review"* between cycles; armed-trigger watch-mode is the only exception, scoped tightly to the specific trigger.
- **Insider-information cross-domain leakage.** A CRO trading securities related to active customers or partners has both ethical and regulatory exposure. *Mitigation:* explicit firewall (Section 10) and periodic surfacing of overlap warnings.
- **Statement-import friction.** If statement pasting becomes onerous, imports lapse, and the transaction ledger silts up. The brief layer degrades silently because hypothesis state stops moving with reality. *Mitigation:* skipped imports surface aggressively; v2 should consider broker-API integration where the data-quality vs. friction tradeoff is favourable.
- **Goal-position mismatch.** Aggressive equities for an emergency fund; long-duration bonds for a 3-year liquidity need. *Mitigation:* `get_goal_progress` includes risk-profile checks; brief layer flags mismatches at quarterly review.
- **Currency-blindness.** SGD-denominated investor with USD-heavy portfolio toward an SGD-denominated goal — currency risk is often invisible until late. *Mitigation:* goal-level hypotheses specify currency of target; brief layer surfaces FX-translated trajectories.
- **Tax-rule drift.** Singapore tax rules change (CPF rates, SRS limits, ABSD adjustments, introduction or removal of reliefs). Stale research findings can produce wrong decisions. *Mitigation:* research-finding state field with `stale` and `retired` states; quarterly review explicitly checks for regulatory updates.
- **Over-precision in projections.** Forecasting 25-year retirement outcomes with two-decimal-place precision creates false confidence. *Mitigation:* projections always reported as ranges; confidence is interpretive (per blueprint) and never load-bearing without human sign-off.
- **Spouse-disagreement opacity.** v1 has no structured surface for spouse-disagreement on hypotheses. Disagreement gets lost between household conversations and the user's own review. *Mitigation:* atoms can carry a `disputed` flag in v1 as a stopgap; v2 should design a proper joint-decision flow.
- **Past-self illegibility under stress.** A pre-commitment written calmly in 2026 may look opaque or obviously wrong during the panic of a 2030 drawdown. *Mitigation:* exit triggers must include rationale, not just condition+action; the rationale is what the future-self reads at the moment of temptation.

---

## 13. Open Questions Specific to This Projection

- **Spouse / co-decision-maker access surface.** v1 treats spouse as an external stakeholder with no direct Loom access. Is there a v2 design for a household-level surface — read-only access to a curated subset, or a joint-review interface? If yes, what's the privacy posture?
- **Broker-API integration timing.** When does manual statement pasting become friction-positive enough to justify automation? Trigger condition: skipped imports become routine, *or* manual pasting bottlenecks the monthly review.
- **CPF / SRS modeling.** CPF and SRS are structurally distinct from broker-held positions (statutory contribution rules, withdrawal restrictions, tax treatment, government-guaranteed components). Are they engagements like other positions, or do they warrant a distinct sub-type with structured fields for contribution caps, withdrawal ages, and tax-relief tracking?
- **Property as a position.** A primary residence is a financial asset, an inflation hedge, a household-utility good, and an emotional commitment all at once. Modelling it as a position alongside ETFs flattens the distinction. Is property a sub-type of engagement, or a separate engagement category with its own fields (mortgage state, valuation, jurisdiction-specific levers like decoupling, ABSD status)?
- **Insurance.** Life, disability, hospitalisation, critical-illness — financial instruments serving goals (downside protection for the household, healthcare affordability for retirement). Are they engagements? Goals? A distinct fourth element overlapping with the health domain?
- **Children's education granularity.** One goal per child, or one goal for "children's tertiary education" with per-child sub-positions? Affects how bequest-style scenarios (one child needs more than another) are modelled.
- **Encryption-at-rest.** Health and finance both warrant elevated protection. Same encryption boundary, distinct boundaries, or distinct keys within a shared boundary? Affects MCP-server architecture and statement-archive design.
- **Statement-archive separation from Loom.** Statements are kept in a separate archive for IRAS retention; Loom holds the extracted atoms. Where is this archive (filesystem path? encrypted volume? cloud snapshot?) and what's its backup posture?
- **A *household financial constitution* meta-artifact.** The CRO projection raised the PBP as a hybrid notebook-with-publication-event status; the content projection raised a *Machine in the Loop* manifesto. Is there an equivalent here — a household financial constitution that drives goal-level hypotheses (allocation principles, behavioural rules, decision-making delegation, bequest philosophy)? Probably yes; structure to be designed.

---

*End of v0.1 finance projection.*
