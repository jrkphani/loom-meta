# 057 — loom-ui: sidebar and detail-pane navigation shell

**Workstream:** W11
**Tag:** AFK
**Blocked by:** #056
**User stories:** US-38

## Behaviour

The main window has a two-pane layout: a sidebar with navigation items (Engagements, Triage, Migration, Settings) and a detail pane that swaps content based on the selection. The app uses a persistent `NavigationSplitView`. Navigation state is managed in a single `AppNavigationModel` observable.

## Acceptance criteria

- [ ] `NavigationSplitView` with a sidebar and detail pane renders without crashes on macOS 26.
- [ ] Sidebar items: Engagements, Triage, Migration, Settings. Each item navigates to a distinct placeholder view.
- [ ] The selected sidebar item is highlighted and persists across app foreground/background cycles (UserDefaults).
- [ ] `AppNavigationModel` is an `@Observable` class injected via `@Environment`.
- [ ] `xcodebuild test -scheme LoomUI` runs at least one ViewModel unit test per navigation section.

## Notes

Do not build any data-fetching logic in this issue — all views are stubs that display the section title. Data-fetching is added in subsequent issues (#058–#063).

The sidebar does NOT include Hypotheses as a top-level item — hypotheses are accessed through an engagement's detail view (a common pattern for parent-child navigation).

Target: macOS 26. Use `List` + `NavigationSplitView` (not the older `NavigationView` API).
