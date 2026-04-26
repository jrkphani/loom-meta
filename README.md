# loom-meta

The planning and coordination repo for Loom. **No build system; no executable code.** Pure markdown plus shell scripts for the autonomous agent.

## Layout

```
loom-meta/
├── docs/                  # the constitution — canonical design corpus
│   ├── loom-design.md
│   ├── loom-blueprint.md
│   ├── loom-system-design-v1.md   ← authoritative for architecture
│   ├── loom-schema-v1.sql
│   ├── loom-api-v1.md
│   ├── loom-style-guide.md
│   ├── projections/
│   │   ├── cro.md         # the only v1 projection
│   │   ├── code.md
│   │   ├── content.md
│   │   ├── finance.md
│   │   └── template.md
│   └── prototype/
│       └── loom-prototype-v2.jsx
├── issues/                # PRD + NNN-*.md vertical slices
│   ├── prd.md
│   └── done/              # completed issues land here
└── ralph/                 # autonomous agent scripts
    ├── prompt.md          # Ralph's operating instructions
    ├── once.sh            # single agent run, human in the loop
    └── afk.sh             # multiple unattended iterations
```

## Why this is its own repo

Cross-repo work (issues that span `loom-core` + `loom-mcp`, or whole-system architecture decisions) lives here rather than fragmenting across the implementation repos. Each implementation repo owns its own code; coordination lives in one place.

## Ralph

Run a single iteration with human approval per edit:

```bash
cd /Users/jrkphani/Projects/loom/loom-meta
./ralph/once.sh
```

Run N unattended iterations (sandboxed):

```bash
cd /Users/jrkphani/Projects/loom/loom-meta
./ralph/afk.sh 10
```

Ralph operates on AFK issues only. HITL issues require human action — Ralph reads them and skips them.

## Conflict resolution

Where this repo's docs disagree with each other, `loom-system-design-v1.md` wins for architecture, `loom-blueprint.md` wins for cross-domain invariants, and `loom-design.md` wins for principles. The PRD references the corpus; it does not override it.
