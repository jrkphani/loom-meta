# 085 — Resources entities and time/people inference

**Workstream:** W17
**Tag:** AFK
**Blocked by:** #076, #080
**User stories:** US-22 (briefs include leverage picture)

## Behaviour

Resources are first-class entities representing the inputs Phani spends to move hypotheses forward — **time, people, financial budget, attention, credibility, knowledge assets, tooling assets** (per blueprint §5.7). Resources are *inferred-first*: where signal exists (calendar density for time, mailbox traffic for people availability), the inference engine derives `Resource` candidates and upserts them. Manual entry is the fallback for categories without inferable signal (financial budget envelopes, attention caps).

For Phase C, ship two inference paths: **time** (from msgvault-comms calendar archive) and **people** (from mailbox traffic + meeting attendee load). Financial, attention, credibility, knowledge_asset, and tooling_asset categories have schema support but inference is manual or deferred.

## Acceptance criteria

- [ ] `loom_core/services/resources.py` is created with CRUD for `Resource`: `create_resource`, `get_resource`, `list_resources`, `update_resource`, `expire_resource`.
- [ ] `POST /v1/resources` creates a manual resource (any category); returns 201.
- [ ] `GET /v1/resources?category=time&domain=work` lists resources scoped to category + domain.
- [ ] `loom_core/llm/stages/leverage_inference.py` is created with `infer_time_resources(window_start, window_end)` and `infer_people_resources(window_start, window_end)`.
- [ ] `infer_time_resources` reads calendar data from msgvault-comms (HTTP call with graceful degradation if msgvault is unavailable); classifies blocks into `deep-work | meeting | travel | admin` by length, attendee count, location; aggregates into per-day category buckets; upserts `Resource` rows with `category='time'`, `inferred_from='calendar_density'`, appropriate `quantity`, `quantity_unit='hours'`, and `window_start`/`window_end`.
- [ ] `infer_people_resources` reads mailbox traffic + meeting attendee patterns; produces `Resource` rows with `category='people'`, `inferred_from='mailbox_traffic'`, naming the stakeholder + their estimated availability over the window.
- [ ] An APScheduler cron job `leverage_inference` runs daily at 06:15 (before state inference at 06:30 so attribution can use fresh resources).
- [ ] Visibility: inferred resources default to `visibility_scope='engagement_scoped'` when they tie to a known engagement; otherwise `'private'`.
- [ ] Unit tests with synthetic calendar fixtures assert: deep-work block inference for a 3-hour uninterrupted slot; meeting inference for a calendar block with 4+ attendees; people resource inference for a stakeholder with N meetings in the window.
- [ ] All four CI gates pass.

## Notes

Reference: `loom-meta/docs/loom-v08-alignment.md` §1.8 (schema) and §5.1 (inference).

Inference-first is the discipline: by the time Phani would have manually entered "I have ~10 hours of deep-work this week," the calendar already knows. Manual entry is reserved for things outside the system's view (financial envelopes set by 1CloudHub finance, attention caps Phani sets on himself).

msgvault-comms HTTP API stability: this is an explicit risk in §14 of the refactor plan. The inference cron must degrade gracefully (skip the run, log a warning) if the calendar endpoint is unreachable. Don't crash the daemon over a missing dependency.

Quality dimensions per category (the JSON `quality_dimensions` column) are populated where meaningful: time resources get `{contiguity_minutes, interruption_density}`; people resources get `{response_rate, avg_latency_hours}`. These are used by attribution (#086) to decide whether a hypothesis is "well-resourced" or "starving."

Financial / credibility / knowledge_asset / tooling_asset inference is deferred to a later phase. The schema exists; the inference engines come when usage justifies them.
