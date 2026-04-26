# 003 — Engagements: full CRUD, close, force-close, and work metadata

**Workstream:** W2
**Tag:** AFK
**Blocked by:** #002
**User stories:** US-9, US-12

## Behaviour

Phani can retrieve, update, and close an engagement. A standard close warns about open hypotheses in the response; a force-close accepts an `override_reason` and closes even with open hypotheses, recording the open count. Work-domain metadata (SOW value, currency, AWS-funded flag, program, swim-lane) is stored via `work_engagement_metadata`. A migration adds the remaining section 4 tables for engagements and atoms.

## Acceptance criteria

- [ ] `GET /v1/engagements/:id` returns the engagement including `work_engagement_metadata` fields.
- [ ] `PATCH /v1/engagements/:id` updates name, type_tag, dates, and/or metadata.
- [ ] `POST /v1/engagements/:id/close` sets `ended_at = now()`; if there are open hypotheses, returns 200 with a `warnings: [{open_hypotheses: N}]` field in the response.
- [ ] `POST /v1/engagements/:id/close` with `body: {force: true, override_reason: "..."}` closes immediately regardless of open hypotheses.
- [ ] Closing an already-ended engagement returns 409 Conflict.
- [ ] Migration adds `work_engagement_metadata`, `work_commitment_direction`, `work_ask_side` (section 4); applies cleanly.
- [ ] `swim_lane` CHECK constraint is enforced: invalid values return 422.

## Notes

Schema: `work_engagement_metadata` (lines ~432–442), `work_commitment_direction` (lines ~462–470), `work_ask_side` (lines ~473–480) in `loom-schema-v1.sql`.

`work_commitment_direction.direction` values: `1ch_to_customer`, `customer_to_1ch`, `1ch_to_aws`, `aws_to_1ch`, `customer_to_aws`, `aws_to_customer`, `1ch_internal`.

`work_ask_side.side` values: `asks_of_aws`, `asks_of_customer`, `asks_of_1cloudhub`.

`swim_lane` values: `p1_existing_customer`, `p2_sales_generated`, `p3_demand_gen_sdr`, `p4_aws_referral`.

Route: `loom-core/src/loom_core/api/engagements.py`.
