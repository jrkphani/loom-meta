# 008 — Inbox sniffer: file detection and confidence routing

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #007
**User stories:** US-1, US-2, US-3

## Behaviour

When a file appears in `inbox/work/{transcripts,dictation,emails,notes}/`, the inbox sniffer identifies its type (Teams transcript, dictation, email excerpt, quick note), parses any frontmatter, assigns a confidence score, and routes it: high-confidence routes create an event immediately; low-confidence routes create a triage item for review. The sniffer is idempotent — processing the same file twice produces no duplicate events.

## Acceptance criteria

- [ ] The sniffer correctly classifies `.vtt`, `.txt` Teams-transcript files as type `process`.
- [ ] Files in `inbox/work/dictation/` are classified as `inbox_derived`.
- [ ] Files in `inbox/work/emails/` or `inbox/work/notes/` with valid frontmatter (`type: email` or `type: note`) are classified as `inbox_derived`.
- [ ] Low-confidence classifications (score < configurable threshold, default 0.7) create a `triage_items` row with `item_type = ambiguous_routing` instead of an event.
- [ ] High-confidence classifications call `events_service.create()` and return the new event ID.
- [ ] A duplicate file (already processed, same source_path) is detected and skipped with no DB write.
- [ ] Unit tests cover: each file type detection, frontmatter parsing, confidence threshold boundary, duplicate detection.

## Notes

File type detection uses file extension + directory path + frontmatter inspection. No external LLM call in the sniffer itself — classification is rule-based (the Apple AI tier is for extraction, not routing, in this pipeline).

Dedup: check `events.source_path` for an exact match. If found, skip.

The sniffer lives in `loom-core/src/loom_core/pipelines/sniffer.py`. It calls `events_service.create()` (from #007) and optionally `triage_service.create_item()` (which will exist after #019).

The confidence threshold is configured in `config.toml` under `[core]` or a `[sniffer]` section. Default: `0.7`.

Vault layout reference: `~/Documents/Loom/inbox/work/{dictation,emails,notes,transcripts}/` (PRD §6.3).
