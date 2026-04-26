# Loom — [Domain Name] Projection

**Domain:** [domain identifier — work, finance, health, content, code, personal]
**Author:** Phani
**Version:** [version · date]
**References:** `loom-blueprint.md` v0.2

---

## 0. About This Document

[One paragraph: what domain this projection covers, what activity sits inside it.]

This projection fills in the blueprint's slots with [domain]-specific vocabulary, atom set, cadence, and retention rules. It does not redefine blueprint primitives.

---

## 1. Vocabulary

| Blueprint primitive | [Domain] term |
| ------------------- | ------------- |
| Domain              | [name]        |
| Arena               | [term]        |
| Engagement          | [term]        |
| Process             | [term]        |
| Process transcript  | [term]        |

[Note any role-label extensions to the universal stakeholder vocabulary, or confirm none.]

---

## 2. Hypothesis Structure

**Two layers, per the blueprint.**

**Arena-level hypotheses** are long-arc bets. Examples:

- [Concrete example 1]
- [Concrete example 2]

**Engagement-level hypotheses** are proximate bets that validate or threaten arena-level bets. Examples within [a specific engagement]:

- [Concrete example 1]
- [Concrete example 2]

**Sizing.** [How many hypotheses per engagement is typical for this domain? What are the natural fault lines?]

**Cross-arena themes.** [Are there themes that span arenas in this domain? How do they emerge?]

---

## 3. Atoms

**Atom set:** [blueprint v1 (decision, commitment, ask, risk, status update) only? Or extended with domain-specific types?]

**Domain-specific atom types** (if any):

- **[Atom type name]** — [definition, lifecycle, when it's used]

**Notes specific to this projection:**

- [Anything notable about how universal atoms manifest here — e.g., direction conventions for commitments, special handling for asks]

---

## 4. Events

**Universal event types in use:**

- [Process events — describe the specific kinds in this domain]
- [Inbox-derived events]
- [Hypothesis state-change events]
- [Research events — relevant to this domain?]
- [Publication events — what reaching-the-world looks like for this domain]
- [External-reference events]

**Domain-specific event types** (if any): [extend or confirm none].

---

## 5. Stakeholder Model

**Stakeholders in this domain are predominantly:** [external named individuals / abstractions / audience personas / mostly self / mixed]

**Concrete examples:**

- [Stakeholder type 1, with example role labels]
- [Stakeholder type 2]

**Cross-domain behaviour:** [how stakeholders in this domain interact with the global entity. Are there overlaps with other domains?]

**Entity resolution:** [how is identity established — email addresses, manual confirmation, fuzzy matching against existing entities]

**Sensitive roles** (if any): [any roles where interpretive content needs special handling — confidence inferences not persisted, etc.]

---

## 6. Inputs

| Input type             | Source / handling |
| ---------------------- | ----------------- |
| [Input type]           | [How it enters Loom, where it lands, how it's processed] |

**Domain-specific inputs** (if any): [e.g., lab results in health, broker statements in finance, web clippings in content].

**Email handling:** [if relevant — whether emails come into the inbox, are accessed live, or both]

---

## 7. Cadence

**Pre-generation:**

- [When engagement-level briefs generate]
- [When arena-level briefs generate]

**Triage:**

- **Engagement-level triage:** [cadence, time budget, target time per engagement]
- **Arena-level triage:** [cadence, time budget]

**Backlog handling:** [what happens when a cycle is skipped]

**Minimum viable triage:** [what gets done when time is short]

---

## 8. Read Tools

**Universal blueprint tools applicable:** [list which of the universal tools this domain uses, with `domain="[domain_id]"` parameter]

**Domain-specific read tools** (if any): [extensions to the universal surface]

---

## 9. Retention

**Defaults from blueprint** [apply unmodified / are modified as below]:

- [Specify modified tiers if different from default 0-6m / 6-12m / 12m+]

**Domain-specific sensitivities:**

- [Statutory retention obligations if any — tax, medical records, regulatory]
- [Sensitivities around interpretive content]
- [NDA, privacy, or contractual deletion obligations]

---

## 10. Privacy Posture

**Domain isolation:** [does this domain need stronger isolation than the default cross-domain query auditability — e.g., separate process, encrypted-at-rest, distinct access controls]

**Within-domain access:** [single-user / shared / specific access patterns]

**Sharing:** [how content from this domain may leave Loom — never, on explicit export, automated, etc.]

---

## 11. Behavioural Ritual

**The most consequential design decision for this projection's success.**

**Triage ritual:**

- **Calendar block:** [when, frequency, what gets it bumped]
- **Time budget:** [target total, target per unit]
- **Sequence:** [exactly what happens, in order]
- **What gets dropped first when time is short:** [...]
- **What's protected:** [...]

**[Other rituals specific to this domain — e.g., monthly portfolio review, quarterly health review]**

**Skip handling:** [what the system does when rituals are skipped — backlog warning at week 1, nudge at week 2, degrade gracefully at week 3, etc.]

---

## 12. Risks Specific to This Projection

[List the failure modes most likely to bite in this domain. The point is to name them now so they can be designed against.]

- **[Risk name]** — [description and mitigation]

---

## 13. Open Questions Specific to This Projection

[Things that need resolution as this projection matures, before or during build.]

- [Open question 1]
- [Open question 2]

---

*End of [domain] projection.*
