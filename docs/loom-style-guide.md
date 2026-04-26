# Loom Style Guide

**Version**: 0.1
**Date**: April 26, 2026
**Status**: Working document — to be refined alongside the v1 build
**Companion to**: `loom-design.md`, `loom-system-design-v1.md`, `loom-prototype.jsx`

---

## 0. How to read this document

This style guide pins the design decisions for the v1 SwiftUI build. It is the bridge between the conceptual design (the why) and the implementation. Every section addresses a concrete UX consideration and gives the developer enough specificity to build without re-deciding.

Where this document conflicts with the prototype, this document wins. The prototype is mid-fi and shows intent; this document captures it precisely.

The voice of this guide echoes the Loom design itself: evidence-respecting, restrained, useful. No platitudes.

---

## 1. Operating principles

These come from the Loom design and govern every UI decision:

1. **The system asks for attention only when there is something to triage.** No dashboards, no daily check-in pressure, no closure rituals. If there is nothing to do, the surface should feel quiet.
2. **Evidence is sovereign; interpretation is provisional.** Factual atoms (decisions, commitments, asks, risks) and interpretive overlays (confidence, momentum) must be visually distinguishable. Users should never confuse the two.
3. **Provenance is structural, not decorative.** Source-of-record is always one click away.
4. **Propose generously, never act silently.** State changes that move strategy require explicit human confirmation, every time. The UI is a briefing surface; it never autoresolves.
5. **Recall over precision.** Triage queues will be larger than feels comfortable. The UI must make dismissal as cheap as confirmation.

If a design decision violates one of these, escalate before shipping.

---

## 2. Platform & frame

### 2.1 Target

macOS 26 (Tahoe) and later. Apple Silicon. Native SwiftUI. Single-user. Minimum viable window: 1100 × 720pt. Ideal: 1440 × 900pt.

### 2.2 macOS Human Interface Guidelines compliance

- **Title bar**: native `NSWindow` titlebar. Use `.titlebarSeparatorStyle(.line)` and a unified toolbar.
- **Toolbar**: contains breadcrumb title, connectivity status pill, command palette trigger, and a single overflow menu. No more than four chrome elements.
- **Sidebar**: standard `NavigationSplitView` with `.sidebar` style. Vibrancy on (`.regularMaterial`).
- **Inspector** (provenance panel): right-side `.inspector` modifier. Toggleable via `⌘⌥I` per macOS convention.
- **Menus**: full menu bar — File, Edit, View, Engagement, Window, Help. Every keyboard shortcut from §9 must be discoverable here.
- **Native scroll bars**: respect system "Show scroll bars" preference. Do not custom-style.
- **Focus rings**: native focus-ring color (system blue) wherever a control accepts keyboard focus.
- **Right-click context menus** are first-class — see §9.3.

### 2.3 Window state

The app is single-window in v1. Closing the window quits the app (do not background-persist UI). The Loom Core daemon and Apple AI sidecar continue to run regardless — the UI is just the eyes.

---

## 3. Voice & microcopy

### 3.1 Voice principles

Loom's voice is **measured, specific, and slightly editorial**. It is the voice of an analyst's notebook, not a chatbot's.

Six rules:

1. **Describe, do not judge.** "L2 ownership at 38%, flat for two weeks" not "Capability transfer is struggling."
2. **Mark interpretation explicitly.** Confidence and momentum copy is always tagged "interpretive · operational" and italicised. Factual atoms are never italicised.
3. **Specific over general.** "8 days late" beats "overdue." "May 12 SteerCo" beats "recent meeting."
4. **No exclamation points. No emoji.** Ever.
5. **Use the loom metaphor when it earns its place.** "Hypotheses (warp)", "Atoms (weft)", "thread", "weave" — these are load-bearing in IA. Avoid forced extensions ("threading the needle", "unraveling").
6. **Address the user as second person, sparingly.** "Your triage backlog is two weeks deep" is fine. "Hi! Let's get started!" is not.

### 3.2 Microcopy patterns

| Pattern | Form | Example |
|---|---|---|
| Empty state | One sentence describing what would appear, one sentence on how to make it appear. | "No evidence attached to this hypothesis yet. Atoms will appear here as they are extracted from transcripts, dictations, and email." |
| Confirmation prompt | Subject + verb + object. No "Are you sure?" | "Confirm state change: H1 progress 60 → 62." |
| Destructive prompt | Spell out the consequence. | "Dismiss atom. This atom will be excluded from future briefs and counted as a dismissal in the learning signal. Provide a reason below." |
| Success | Past tense, terse. | "Confirmed. H1 progress now 62." |
| Stale data warning | What is stale, how stale, what to do. | "Brief last refreshed Mon 07:00. Tuesday refresh failed; Claude API was unreachable. Showing last good version." |
| Error | What went wrong, what is unaffected, what to try. | "Apple AI sidecar offline. Atom extraction is falling back to Claude (slower). Run `loom doctor` to diagnose." |
| Triage backlog | Acknowledge the skip, name the consequence. | "Triage backlog is now 2 weeks. Audience signals from 14 atoms unprocessed. Consider a partial pass to prevent silting." |

### 3.3 Forbidden phrases

- "Oops!" / "Whoops!" / any cute apology
- "We" — Loom is not a team, it is a tool. Use "the system" or passive voice when needed.
- "AI-powered" / "Smart" / "Magic" — describe what it does, not how.
- "Successfully" — superfluous.
- Hype verbs: "unleash", "supercharge", "transform". Loom helps you keep the minutes.

---

## 4. Visual language

### 4.1 Typography

| Role | Typeface | Notes |
|---|---|---|
| Display (hypothesis statements, view titles) | Newsreader (variable, opsz 6–72) | A serif designed for screen reading. Restrained, editorial, propositional. Use 500 weight for statements, 600 for view titles. |
| UI chrome (labels, buttons, navigation, atom text) | Manrope (variable, 300–700) | Humanist sans, slightly distinctive. 400 default, 500 emphasis, 600 buttons. |
| Mono (timestamps, IDs, atom kinds, code) | JetBrains Mono | 400 only. Used for anything algorithmically generated (ULIDs, dates, percentages). |

**SwiftUI mapping**: register the three families via `Font.custom`. Define a `LoomFont` enum with `.display(.body)`, `.ui(.label)` etc. variants.

**Type scale** (pt):

| Token | Size | Line height | Use |
|---|---|---|---|
| `display.title` | 28 | 32 | Engagement title |
| `display.h2` | 22 | 28 | Selected hypothesis statement |
| `display.h3` | 18 | 24 | Tab heading |
| `display.body` | 13.5 | 19 | Hypothesis statement in cards |
| `ui.body` | 13 | 18 | Default body |
| `ui.label` | 12 | 16 | Form labels, calendar items |
| `ui.caption` | 11 | 15 | Secondary metadata |
| `ui.micro` | 10 | 14 | Eyebrow labels, "Tab pressed" hints |
| `mono.body` | 11.5 | 16 | Timestamps, percentages |
| `mono.caption` | 10 | 14 | IDs, secondary mono |

**Eyebrow labels** (e.g. "Atoms (weft)", "Recent evidence") use `ui.micro`, uppercase, letter-spacing 0.12em, color `text.tertiary`.

### 4.2 Color

The palette is **warm parchment with restrained accents**. It is intentionally not the cliché purple-on-white SaaS palette.

| Token | Light hex | Use |
|---|---|---|
| `bg.canvas` | `#fafaf9` | App background |
| `bg.surface` | `#ffffff` | Cards, panels, primary surfaces |
| `bg.subtle` | `#f5f5f4` | Sidebar, tab strip resting |
| `bg.warp` | `#fefce8` (amber-50, 30% opacity over canvas) | Today strip, selected sidebar item |
| `border.hairline` | `#e7e5e4` | Default borders, dividers |
| `border.emphasis` | `#d6d3d1` | Hover/focus borders |
| `text.primary` | `#1c1917` | Body |
| `text.secondary` | `#57534e` | Secondary |
| `text.tertiary` | `#a8a29e` | Eyebrow labels, metadata |
| `accent.warp` | `#a16207` (amber-700) | Hypothesis thread, active selection, primary actions |
| `accent.weft` | `#0f766e` (teal-700) | Atom intensity, asks, secondary actions |
| `state.green` | `#10b981` | Confidence high, on-track |
| `state.amber` | `#f59e0b` | Confidence mid, at-risk |
| `state.red` | `#f43f5e` | Confidence low, blocked, overdue |
| `state.sky` | `#0284c7` | Status (factual reports, neither good nor bad) |

**Dark mode**: defer to v1.1. Mac users frequently use dark mode; design tokens are namespaced so a dark theme can be added without rewrites.

**Color principles**:

- A view should have **one accent**. The Today strip is warp-tinted; the warp/weft diagram is teal-accented; the rest of the engagement detail is neutral with state colors. Mixing accents reads as disorder.
- **State colors are desaturated** (we are running a CRO's tool, not a hospital ER). Compare `#f43f5e` (rose-500) to a saturated red like `#dc2626` — the former is firm but does not panic.
- **Never use color alone to convey meaning.** All state colors pair with text labels, glyphs, or position. (Accessibility — see §13.)

### 4.3 Spacing

8-point grid. Component padding rounded to multiples of 4.

| Token | pt | Use |
|---|---|---|
| `space.xs` | 4 | Inline gaps within a row |
| `space.sm` | 8 | Default gap between siblings |
| `space.md` | 12 | Card internal padding (compact) |
| `space.lg` | 16 | Card internal padding (default) |
| `space.xl` | 24 | Section gaps |
| `space.2xl` | 32 | Major view margins |

**Vertical rhythm**: section labels sit 24pt above their content. Cards within a section gap 8pt. Two sections within a tab gap 32pt.

### 4.4 Iconography

Use **Lucide** (web prototype) and **SF Symbols** (SwiftUI build). Maintain glyph parity:

| Concept | Lucide | SF Symbol |
|---|---|---|
| Decision | `CheckCircle2` | `checkmark.circle` |
| Commitment | `ListChecks` | `checklist` |
| Ask | `ArrowRight` | `arrow.right` |
| Risk | `AlertTriangle` | `exclamationmark.triangle` |
| Status | `Activity` | `waveform.path` |
| Provenance | `FileText` | `doc.text` |
| Triage | `Inbox` | `tray` |
| Migration | `History` | `clock.arrow.circlepath` |

Icon size: default 13pt at 1x in chrome, 12pt in dense lists, 14pt in toolbar.

### 4.5 The loom motif

The metaphor manifests visually in three places — and only three places, to avoid kitsch.

1. **App mark**: three horizontal lines crossed by three vertical lines, drawn with hairline strokes. Used in the title bar and as the document icon. Never decorative.
2. **Warp/weft background texture**: a 1-pixel cross-hatch at 2.5% opacity. Used only as a subtle background on the Timeline chart and the Composition tab (where the metaphor is operative). Never on resting surfaces.
3. **Warp/weft diagram** on the Composition tab: hypotheses as horizontal warp threads, stakeholders as vertical weft threads, atoms as crossings sized by intensity. This is the metaphor's proof of work.

Outside these three, the loom metaphor lives in copy ("warp", "weft", "thread") only.

---

## 5. Motion

### 5.1 Principles

- **Motion serves comprehension, not delight.** Every animation must answer a "what just happened" or "what is now possible" question.
- **Durations short, easings calm.** Default: 180ms ease-out. Slower for larger surfaces (panel slide: 240ms). Never longer than 320ms.
- **Respect Reduce Motion.** When `accessibilityReduceMotion` is true, replace transitions with instant changes. Test this.

### 5.2 Specific motions

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Tab switch | Fade through (current out, new in, opacity 0 ↔ 1) | 160ms | ease-out |
| Provenance panel | Slide from right with fade (translateX 12px → 0, opacity 0 → 1) | 240ms | ease-out |
| Atom card hover | Border emphasis + 1pt elevation | 120ms | ease-out |
| Sidebar item hover | Background color | 100ms | ease-out |
| Layer chip toggle | Scale from 0.96 → 1.00, color cross-fade | 140ms | ease-out |
| Triage badge increment | Pulse once (scale 1 → 1.08 → 1) | 220ms | ease-in-out |
| State dot transition | Color cross-fade only, no scale | 140ms | linear |
| Loading skeleton shimmer | Linear gradient sweep | 1200ms | linear, repeat |
| Warp/weft first render | Warp threads stroke-draw L→R, then weft top→bottom, then crossings fade in (staggered 30ms) | total 800ms | ease-out |

The warp/weft entrance animation is the only piece of "delight" motion. It earns its place because it teaches the metaphor on first encounter.

### 5.3 Microinteractions

- **Atom dismissal**: the card slides 200pt right and fades out (180ms), revealing an undo affordance below for 5 seconds.
- **Layer chip activation**: the dot pulses once when toggled on; nothing on toggle off.
- **Provenance drill-through**: when clicking a related provenance link, the panel content fades through rather than reloading from blank.
- **Triage queue completion**: when the last item is processed, the queue area dissolves and reveals "Queue clear. Next refresh at Wed 07:00."

---

## 6. Components

This is the canonical component catalog. Every new view should compose from these. New components require sign-off and addition to this list.

### 6.1 Pill

A small ring-bordered status chip. Five tones: neutral, green, amber, red, teal. Two sizes: sm (10pt text), md (11pt text). Optional leading dot or icon.

**Use**: state labels (active, amber), counts ("5 hypotheses"), categorical tags ("asks-of-AWS").

**Don't**: use as a button. Use as the only signal of a destructive action.

### 6.2 AtomCard

The fundamental information unit. Renders one atom — kind glyph (left), kind label, date, severity/owner/side metadata, atom text, source link.

**States**: default, hover (border emphasis + lift), selected (warp-tinted border), overdue (rose-tinted background), dismissed (grayed, struck-through, hidden by default).

**Reuse**: triage queue, hypothesis detail, related provenance, Today strip (compact variant).

### 6.3 HypothesisCard (master list)

Compact representation in the master/detail. Contains label, type, statement (3-line clamp), state dot + momentum arrow, progress %, atom counts.

**States**: default, hover, selected (warp-tinted left border + warp-tinted background).

### 6.4 StateDim (3-D state)

The progress / confidence / momentum trio. Each dimension has a label, a current value, a visual treatment, and an interpretive marker ("interpretive · operational" italicised) where applicable.

**Don't**: collapse confidence and momentum into a single "status" pill. The three dimensions exist deliberately.

### 6.5 LayerChip

Toggleable chip used in the Timeline tab. Active state inverts (dark fill, light text).

### 6.6 SidebarItem

A nav item. Icon + label + optional count badge. Active state has a subtle background.

### 6.7 ProvenancePanel

Right-side inspector. See §7.4.

### 6.8 CommandPalette

⌘K modal. See §10.2.

### 6.9 Toolbar

The macOS unified toolbar. See §2.2.

### 6.10 Banner

Full-width strip used for stale-data warnings, connectivity issues, and triage-backlog nudges. Tones match Pill. Always dismissable except for offline state.

### 6.11 EmptyState

Centered illustration glyph, 16pt heading, 12pt sub, optional inline action. See §8.2.

### 6.12 Skeleton

Resting placeholder for loading content. Three variants: line, card, chart. Shimmer animation only.

---

## 7. View patterns

### 7.1 Engagement Detail (the spine)

**Layout**: header → Today strip → tab bar → tab content. Tab content is master-detail (Hypotheses) or full-bleed (Timeline, Diff, Composition).

**Defaults**: Hypotheses tab open, first hypothesis selected. State persists per engagement (see §11).

**Density**: Things-3 lean. Generous whitespace, restrained color, single accent (warp).

### 7.2 Hypotheses tab — master/detail

Master list ~320pt fixed width. Detail flexes. Master scrolls independently. Detail scrolls independently.

The detail page reads top-down: statement → 3-D state → atom counts → recent evidence list. The reader can scan or stop.

### 7.3 Timeline tab

The chart is the page. Layer toggles above the chart, chart itself below, pivotal log beneath. The pivotal log is a chronological mirror of the chart's reference lines, scannable when the chart is too dense.

### 7.4 Provenance panel

- Width: 380pt fixed.
- Slide-in from right (240ms).
- Persistent: stays open until dismissed.
- Pinnable: pin icon in header — when pinned, panel takes a permanent column (main content squeezes).
- Drill-through: clicking related provenance fades content through; the panel itself does not reanimate.
- Esc dismisses.
- ⌘⌥I toggles per HIG inspector convention.

---

## 8. State handling

### 8.1 Loading states

Loom Core is local; most loads complete in <100ms. Skeletons appear only when a load exceeds 200ms (typically: brief generation, timeline data assembly).

| Surface | Loading treatment |
|---|---|
| Engagement detail header | No skeleton — render shell instantly with cached data, fade in updates |
| Hypothesis list | Skeleton cards (3 lines + dot) up to 250ms |
| Hypothesis detail | Skeleton statement (2 lines), skeleton state dimensions, skeleton atom cards (3 cards) |
| Timeline chart | Chart skeleton: axes drawn, line shimmering grey, layer chips ready and clickable (toggling shows immediately when data arrives) |
| Warp/weft diagram | Threads drawn, crossings fade in once data arrives |
| Brief generation (background) | Subtle progress indicator in toolbar — small spinning glyph; tooltip explains "Generating Tuesday brief…" |

**Never** show a full-screen spinner. The shell renders first; data fills in.

### 8.2 Empty states

Each empty state names what would be there, one consequence of it not being there, and one path to populate it.

| Surface | Empty copy |
|---|---|
| No engagements in arena | "No engagements in this arena yet. Create one from the Engagement menu, or drop a transcript into `~/Documents/Loom/inbox/work/` and the system will route it." |
| No hypotheses on engagement | "No hypotheses defined. A hypothesis is the bet you are making about this engagement. Add one to start attaching evidence." |
| No atoms on hypothesis | "No evidence attached yet. Atoms will appear here as they are extracted from transcripts, dictations, and email." |
| No items in Today strip | "No calendar items touch this engagement today." |
| Empty triage queue | "Queue clear. The system will resurface when there is something for you to look at." |
| Empty timeline | "Not enough history yet. Two weeks of evidence are needed before a meaningful timeline renders." |
| No diff (this Tuesday matches last) | "No state changes since last Tuesday. The engagement is steady — that is itself a finding." |
| No connectivity (Claude unreachable) on a feature requiring it | "Brief regeneration is queued. Showing last good brief from Mon 07:00." |

Empty states use a small custom glyph (a single thread, a single intersection — quiet), `display.h3` heading, `ui.body` sub. No illustrations of cartoon characters.

### 8.3 Error states

Three tiers:

**Tier 1 — Inline correction** (recoverable, contextual):
- Form validation: red 11pt text below the field. Form save remains possible if the user wants to override (e.g., "Override reason is required" disables Save until provided).

**Tier 2 — Banner** (degraded but functional):
- Stale brief: amber banner at the top of engagement detail, dismissable. "Brief last refreshed Mon 07:00. Tuesday refresh failed. [Retry] [Run loom doctor]"
- Apple AI sidecar offline: amber banner. "Apple AI sidecar offline. Atom extraction falling back to Claude (slower). [Restart sidecar]"
- Triage backlog: amber banner. Persists. "Triage backlog: 2 weeks (14 atoms). [Open queue]"

**Tier 3 — Modal** (system unavailable):
- Loom Core unreachable: full-window state with a single message and a single action. "Loom Core is not responding. The UI cannot operate without it. [Run loom doctor in Terminal] [Retry connection]"
- Database integrity check failed at startup: "Database integrity check failed. Restore from backup before continuing. [Open backups folder] [View documentation]"

Errors must always tell the user (a) what is broken, (b) what is unaffected, (c) what to try next. No bare "Something went wrong."

### 8.4 Stale data handling

Loom briefs are pre-generated on cron. If the brief is more than 24 hours old or generation failed, surface this prominently — the user must know they are reading a stale read.

Affordance: timestamp visible at top of every brief surface ("last brief Tue 07:00") with tone change to amber if stale.

---

## 9. Interaction

### 9.1 Keyboard navigation

Loom is keyboard-first by deliberate choice. Every action accessible via mouse must have a keyboard equivalent.

**Global shortcuts**:

| Shortcut | Action |
|---|---|
| `⌘K` | Open command palette |
| `⌘1` … `⌘4` | Switch tabs (Hypotheses, Timeline, Diff, Composition) |
| `⌘[` / `⌘]` | Navigation back / forward |
| `⌘L` | Focus search |
| `⌘⌥I` | Toggle provenance panel |
| `⌘⌥1` | Toggle sidebar |
| `⌘R` | Force refresh (poll Loom Core) |
| `⌘E` | Export current brief |
| `⌘,` | Settings |
| `?` | Show keyboard shortcut overlay |

**In-context shortcuts** (when the focus context applies):

| Context | Shortcut | Action |
|---|---|---|
| Hypothesis list | `J` / `K` (or `↓` / `↑`) | Move selection down / up |
| Hypothesis list | `Enter` | Select / drill into |
| Atom card focused | `Space` | Open provenance |
| Atom card focused | `A` | Attach to hypothesis |
| Atom card focused | `D` | Dismiss with reason |
| State proposal focused | `C` | Confirm |
| State proposal focused | `O` | Override (opens form) |
| Provenance panel open | `Esc` | Close |
| Modal open | `Esc` | Cancel |
| Any text field | `⌘Enter` | Submit |

**Tab order** within engagement detail: Sidebar → Triage CTA → Tab bar → Master list → Detail content → Provenance trigger.

All shortcuts must appear in the menu bar items so they are discoverable per macOS convention.

### 9.2 Hover states & tooltips

Hover is informational. The tooltip is for "what is this?" not "what does this do?".

| Element | Tooltip content |
|---|---|
| State dot | "Confidence: amber — interpretive, regenerated from recent evidence" |
| Momentum arrow | "Momentum: slowing — interpretive, last two weeks vs prior" |
| Warp/weft crossing | "H1 × Tatsuya — 3 atoms, most recent May 12" |
| Source icon | "Teams transcript · May 12 SteerCo · paragraph 47" |
| Triage badge | "12 awaiting triage: 3 state-change proposals, 7 atoms, 2 ambiguous" |
| Connectivity pill | "All systems normal" or per the issue |
| Pivotal event marker | "May 12 — CTO approved target architecture (decision)" |
| Stakeholder name | Full name + role + last seen in evidence |

Tooltip delay: 500ms hover (macOS default). Always dismiss on cursor leave or Escape.

Hover state visual: subtle border emphasis + 1pt elevation on cards; background color shift on rows; cursor change to pointer on interactive elements.

### 9.3 Right-click context menus

A Mac convention. Right-click should always offer a useful, contextual menu.

| Element | Right-click menu |
|---|---|
| Hypothesis card | Open · Open in new tab · Edit statement · View provenance for state · Archive · Copy ID |
| Atom card | View provenance · Attach to other hypothesis · Dismiss with reason · Mark resolved (commitments) · Copy text · Copy as quote |
| Sidebar engagement | Open · Mark inactive · Generate brief now · Export brief · Show in vault |
| Timeline pivotal event | View atom · Edit annotation · Remove from pivotal |
| Empty space in canvas | Refresh · Show / Hide sidebar · Show / Hide provenance · Settings |

### 9.4 Focus management

- When the provenance panel opens, focus moves into it (the close button receives focus). When it closes, focus returns to the triggering atom card.
- When a modal opens, focus moves into it. Tab cycles within the modal until closed.
- When a tab changes, focus returns to the tab bar. The first interactive element in the new tab does not auto-focus (users coming from keyboard expect to land on the tab they switched to).
- Focus rings are always visible when navigating by keyboard (use `@FocusState` + `.focusable()` modifiers in SwiftUI).

### 9.5 Touch & gestures (future)

v1 is Mac only, but if iPad is added in v1.x:

- Touch targets minimum 44 × 44pt.
- Two-finger swipe = back / forward (matches trackpad).
- Long-press = context menu.
- Atom card swipe-left = quick dismiss (like Mail).

These are not for v1; documented to keep iPad parity in mind.

---

## 10. Layout & adaptability

### 10.1 Window sizes

| Width range | Behavior |
|---|---|
| ≥ 1440pt | Full layout: sidebar + main + provenance (when open). Optimal. |
| 1200–1440pt | Sidebar + main + provenance overlay (instead of pushed). Provenance overlays main with backdrop blur. |
| 1100–1200pt | Sidebar collapses to icon-only mode. Main takes full remaining width. Provenance overlays. |
| < 1100pt | Window resists resize below 1100pt. Minimum enforced. |

Sidebar collapse is animated: icons remain, labels fade out, width transitions from 244pt to 56pt. ⌘⌥1 toggles.

### 10.2 Type scaling

Respect macOS Dynamic Type system preference. The type scale (§4.1) is the default; users with larger system text get scaled-up sizes proportionally. Test at 110% and 125%.

Hypothesis statements and atom text are the most likely to wrap aggressively at large sizes — the master/detail layout must accommodate. Hypothesis cards should grow taller, never push the layout.

### 10.3 Long content handling

| Content type | Maximum | Treatment past max |
|---|---|---|
| Hypothesis statement | 200 chars | Truncate in card with ellipsis, full text in detail and tooltip |
| Atom text | 280 chars | Truncate in compact contexts (Today strip), full in detail |
| Stakeholder name | 32 chars | Truncate with tooltip |
| Engagement name | 60 chars | Truncate in sidebar, full in breadcrumb |
| Source excerpt | unlimited | Scrollable within provenance panel |

Reading line length for prose blocks (provenance excerpts, hypothesis statements in detail): max ~62ch.

---

## 11. State persistence

### 11.1 What persists

Stored in `UserDefaults` (per-user, per-app):

- Window position and size
- Sidebar expanded/collapsed state
- Sidebar arena expansion state (which arenas are open)
- Last-selected engagement (per arena)
- Last-selected hypothesis (per engagement)
- Last-selected tab (per engagement)
- Timeline layer toggles (per engagement)
- Provenance panel pinned state
- Triage view preferences (sort, filter)
- "First-run tour completed" flag

### 11.2 What does not persist

- Provenance panel open/closed state (always closes on app quit, opens on user action)
- Active modals (closed on quit)
- Drafts in unsaved forms (lost on quit; if a draft would be valuable to retain, save it explicitly to disk — see §11.3)

### 11.3 Drafts

Triage forms (override reasons, dismissal reasons) and any free-text input must persist within a session — if the user closes the form, reopens it, the text is still there until explicitly cleared or submitted.

For drafts longer than 100 characters that the user navigates away from (not just closes the form), Loom should auto-save to a `drafts/` directory under app support and offer to restore on next open.

---

## 12. Permissions

Loom v1 requests the following macOS permissions, each contextually:

| Permission | When requested | If denied |
|---|---|---|
| Files (vault directory) | First launch — required for any operation | Modal: "Loom needs access to your vault. Without it, the app cannot operate. [Choose folder] [Quit]" |
| Calendar | First time the Today strip would render | Today strip shows: "Calendar access not granted. [Grant in System Settings]". The strip becomes a stub but the app continues to function. |
| Email (Outlook MCP) | First time an email atom is encountered (the user clicks provenance on an email-sourced atom) | Provenance panel shows: "Email access required to view source. [Grant access]" |
| Microphone (if Superwhisper integration is configured) | First time the user records a dictation through the in-app capture | Skip; user dictates externally and drops in inbox. |
| Notifications | First time a triage backlog warning would fire | Skip; warnings remain visible in-app banner. |
| Full Disk Access (for Time Machine snapshot inspection in `loom doctor`) | Only if the user runs `loom doctor` and it needs to inspect Time Machine | Skip; doctor reports that section as unknown. |

**Principles**:
- Never request a permission at first launch unless required for the app to start.
- Always explain why before the system prompt fires (Loom shows a pre-flight dialog with the rationale, then triggers the system permission prompt on user click).
- Denial degrades, never blocks. Except for the vault permission which is foundational.
- Re-request only on user action (clicking the "Grant access" inline link), never automatically.

---

## 13. Onboarding & discoverability

### 13.1 First launch

The first time Loom opens with a non-empty vault:

1. A welcome modal appears: "Loom is ready. Three things you should know." Three short cards covering: the four tabs, the triage ritual, the command palette (`⌘K`).
2. Modal dismisses on click; never appears again.
3. The user lands on the engagement detail of the engagement with the most active triage items.

If the vault is empty:

1. A different first-launch view: "Drop a transcript or note into `~/Documents/Loom/inbox/work/` and Loom will route it. The first brief renders within an hour."
2. A "Show me how" link opens the docs (offline markdown bundled with the app).

### 13.2 Contextual help

- A `?` icon in the toolbar opens a side help panel with the current view's keyboard shortcuts and a short "what this is for" explainer. Closes on Esc.
- The first time a user hovers a warp/weft crossing, a one-time tooltip appears: "Click any crossing to jump to that hypothesis." Dismisses on click and never returns.
- The first time the triage queue exceeds 20 items, a one-time banner: "Larger queues are normal. The system extracts generously and lets your dismissals teach it what is noise."

### 13.3 Command palette as discoverability surface

`⌘K` opens a centered modal with:
- Search input at top
- Recent commands
- Categories: Navigate, Triage, Brief, Settings, Help
- Every action in the app is reachable from here

This serves three purposes: power-user efficiency, discoverability for users who do not know shortcuts, and a recall affordance for the one-thing-I-can-never-remember.

---

## 14. i18n & l10n preparedness

v1 ships English-only and is single-user (Phani). However:

### 14.1 Code-level preparation

- All UI strings live in `Localizable.strings` (or SwiftUI `LocalizedStringKey`).
- No string concatenation. Use full sentences with placeholders: `"%@ atoms unprocessed"` not `"\(count) atoms unprocessed"` mixed with adjacent literal text.
- Pluralization via `.stringsdict`.
- Date, time, number, currency formatting via `Date.FormatStyle`, `NumberFormatter`. Never hardcode formats like `"MMM d"` for display — use `.formatted(date: .abbreviated, time: .omitted)`.

### 14.2 Layout flexibility

- Allow ~30% text expansion for German/French. Atom cards and hypothesis cards must accommodate longer translated strings.
- Use logical properties (leading/trailing) not directional (left/right).
- Avoid fixed widths on text containers.

### 14.3 Non-Latin script support

Stakeholder names will include Japanese (Tatsuya 佐藤), Chinese, Indian-language (Telugu, Tamil) names. Newsreader and Manrope cover Latin/Greek/Cyrillic. Configure system fallback for CJK glyphs (the OS will substitute Hiragino Sans, etc.). Test with sample names early.

### 14.4 RTL

Not required for v1 but layout uses logical properties throughout to avoid retrofit later.

---

## 15. Accessibility

### 15.1 Color & contrast

- All text on `bg.canvas` and `bg.surface` meets WCAG AA contrast (4.5:1 for body, 3:1 for large). Run a contrast check on every new color combination before shipping.
- Never use color alone to convey state. State pills always pair color + text + dot. Diff rows tinted by tone always include the "Δ" column with explicit symbol.
- Tested: `text.primary` on `bg.canvas` = 15.8:1 ✓. `text.secondary` on `bg.canvas` = 7.4:1 ✓. State amber pill text on amber-50 = 6.1:1 ✓.

### 15.2 Screen reader

- Every interactive element has a clear `accessibilityLabel`.
- Atom cards announce as: "Decision, May 12. CTO Tatsuya approved S/4HANA target architecture. Source: Teams transcript, May 12 SteerCo. Activate to open provenance."
- The warp/weft diagram includes a screen-reader-only table view of the same data, exposed via a `accessibilityElement` with custom rotor.
- Status messages (e.g., "Confirmed. H1 progress now 62") fire as `.announcement` accessibility notifications.

### 15.3 Keyboard

Every interaction in §9.1 must be operable without a pointing device. The provenance panel, command palette, modal forms — all keyboard-complete.

### 15.4 Motion

`accessibilityReduceMotion` disables: warp/weft entrance animation, layer chip pulse, atom dismissal slide. Replace with instant transitions.

### 15.5 Type

`accessibilityFontScale` respected throughout (see §10.2).

---

## 16. Connectivity & offline

Loom Core is local. The app is **offline-capable by design** for everything except brief regeneration (which calls Claude API).

### 16.1 Connectivity indicator

A pill in the toolbar shows the system status. Three states:

- **All systems normal** (green dot): Loom Core ✓, Apple AI sidecar ✓, Claude reachable ✓.
- **Degraded** (amber dot): one of Apple AI or Claude unreachable. Tooltip explains. App continues; degraded operations are flagged.
- **Local only** (gray dot): Both Apple AI and Claude unreachable. Brief regeneration paused; reads continue from cache.

Click the pill: dropdown shows each component's status, last successful contact, and a link to "Run loom doctor".

### 16.2 Behavior under degraded connectivity

| Operation | Online | Apple AI offline | Claude offline | Both offline |
|---|---|---|---|---|
| View brief | ✓ | ✓ | ✓ | ✓ (last good) |
| View hypothesis state | ✓ | ✓ | ✓ | ✓ |
| Open provenance | ✓ | ✓ | ✓ | ✓ |
| Triage atom | ✓ | ✓ | ✓ | ✓ |
| Generate new brief | ✓ | ✓ (Claude takes over) | ⚠ template-only with banner | ⚠ template-only |
| Extract atoms from new transcript | ✓ | ⚠ falls back to Claude (slower) | ⚠ queued | ⚠ queued |
| Migration rewrite | ✓ | ⚠ falls back to Claude | ⚠ queued | ⚠ queued |

### 16.3 Connectivity change UX

- Connection lost: amber banner appears; persists until restored or dismissed.
- Connection restored: brief green confirmation banner ("Connection restored. Queued operations resumed."), auto-dismisses after 4s.
- Don't badger. One banner per state change, not one per affected feature.

---

## 17. Quality bar — checklist for any new view

Before any new view ships, walk this list:

- [ ] **Voice**: Microcopy follows §3 voice principles. No forbidden phrases.
- [ ] **Empty**: Every container has an empty state (§8.2).
- [ ] **Loading**: Skeleton appears for any load >200ms (§8.1).
- [ ] **Error**: Each tier (inline / banner / modal) is accounted for (§8.3).
- [ ] **Stale**: If data has a freshness, surface its age (§8.4).
- [ ] **Keyboard**: Every action keyboardable. Tab order tested (§9.1).
- [ ] **Hover & tooltip**: Every non-obvious element explains itself on hover (§9.2).
- [ ] **Right-click**: Useful context menu where applicable (§9.3).
- [ ] **Focus**: Modals & panels manage focus correctly (§9.4).
- [ ] **Resize**: Tested at 1100, 1280, 1440, 1920 widths (§10.1).
- [ ] **Type scale**: Tested at default, 110%, 125% (§10.2).
- [ ] **Long content**: Truncation rules applied (§10.3).
- [ ] **Persistence**: Decided what persists per §11.
- [ ] **Permissions**: Any new permission requested contextually with rationale (§12).
- [ ] **Discoverability**: New feature reachable from `⌘K` palette and menu bar (§13.3).
- [ ] **i18n**: Strings externalized; no concatenation; layout accommodates 30% expansion (§14).
- [ ] **A11y**: Contrast checked, screen reader labels written, motion reduce-tested (§15).
- [ ] **Offline**: Behavior documented for each connectivity state (§16).
- [ ] **Loom motif**: Used only in the three sanctioned places (§4.5).

---

*End of v0.1. Refine alongside the build.*
