// Data behind the four-framework tree explorer.
// Every node carries a "fate": what happens to that file once the work ships.
// That's the axis the article is actually about, so it's the axis the tree colours by.

export type Fate = "durable" | "frozen" | "scratch" | "tooling" | "code";

export const FATE_LABEL: Record<Fate, string> = {
  durable: "Durable",
  frozen: "Frozen record",
  scratch: "Scratch",
  tooling: "Tooling",
  code: "Code",
};

export const FATE_BLURB: Record<Fate, string> = {
  durable: "Still worth editing after the work ships.",
  frozen: "A record of one increment. Never edited again, never reconciled.",
  scratch: "Written to be executed once, then ignored. Disposable by design.",
  tooling: "The framework's own machinery. Not a project artifact.",
  code: "The thing you actually shipped.",
};

export const FATE_COLOR: Record<Fate, string> = {
  durable: "#2f9e6e",
  frozen: "#b9832b",
  scratch: "#8a8f9e",
  tooling: "#6f7bff",
  code: "#c0616f",
};

export interface TreeNode {
  name: string;
  dir?: boolean;
  fate?: Fate;
  /** Short right-hand annotation, shown inline in the tree. */
  hint?: string;
  /** Longer explanation, shown in the detail pane. */
  note?: string;
  /** Illustrative contents for this file. */
  example?: string;
  exampleLang?: string;
  children?: TreeNode[];
  /** Expanded on first render. */
  open?: boolean;
}

export interface Framework {
  id: string;
  name: string;
  tagline: string;
  unit: string;
  survives: string;
  verdict: string;
  tree: TreeNode;
}

export const FRAMEWORKS: Framework[] = [
  {
    id: "speckit",
    name: "Spec Kit",
    tagline: "Procedural. Phase gates between numbered, branch-bound features.",
    unit: "A numbered feature, tied 1:1 to a git branch",
    survives: "constitution.md, and CLAUDE.md if you count agent context",
    verdict:
      "An append-only log of increments. Nothing in the repo says what notes is for, only what feature 001 changed.",
    tree: {
      name: "todo-notes/",
      dir: true,
      open: true,
      children: [
        {
          name: ".specify/",
          dir: true,
          fate: "tooling",
          hint: "the framework itself",
          note: "Installed machinery: the scripts the slash commands shell out to, and the templates they render.",
          children: [
            {
              name: "memory/constitution.md",
              fate: "durable",
              hint: "project principles",
              note: "One of only two files here that outlive the branch. Principles the agent is meant to hold to across every feature, and the closest Spec Kit gets to a standing document about the project.",
              exampleLang: "markdown",
              example: `# Notes App Constitution

## Core Principles

### I. Library-First
Every feature starts as a standalone library with a clear
contract. No feature logic lives directly in the app shell.

### II. Test-First (NON-NEGOTIABLE)
TDD is mandatory: tests written -> user approved -> tests fail
-> then implement. Red-Green-Refactor, strictly enforced.

### III. Integration Testing
Contract tests are required for: new library contracts,
contract changes, and inter-service communication.

## Governance
This constitution supersedes all other practices. Amendments
require documentation, approval, and a migration plan.

**Version**: 1.2.0 | **Ratified**: 2026-01-08`,
            },
            {
              name: "scripts/bash/",
              dir: true,
              fate: "tooling",
              hint: "create-new-feature.sh",
              note: "Where the branch coupling is enforced. The script derives the folder name from your description, creates the matching branch, and every later command finds the active feature by reading the branch you're on.",
              exampleLang: "bash",
              example: `# create-new-feature.sh (abridged)
BRANCH_NAME="\${FEATURE_NUM}-\${SHORT_NAME}"
git checkout -b "$BRANCH_NAME"
mkdir -p "specs/$BRANCH_NAME"
cp .specify/templates/spec-template.md \\
   "specs/$BRANCH_NAME/spec.md"

# ...and every later command does the inverse:
#   CURRENT=$(git rev-parse --abbrev-ref HEAD)
#   FEATURE_DIR="specs/$CURRENT"
# which is why the folder name and the branch name
# are not allowed to drift apart.`,
            },
            {
              name: "templates/",
              dir: true,
              fate: "tooling",
              hint: "spec, plan, tasks",
              note: "The shapes /speckit.specify, /speckit.plan and /speckit.tasks fill in.",
            },
          ],
        },
        {
          name: ".claude/commands/",
          dir: true,
          fate: "tooling",
          hint: "/speckit.*",
          note: "constitution → specify → plan → tasks → implement, with real gates between the phases. This workflow is the best documented of the four.",
          exampleLang: "text",
          example: `/speckit.constitution   once per project
/speckit.specify        what & why      -> spec.md
/speckit.clarify        de-risk the spec
/speckit.plan           how             -> plan.md + friends
/speckit.tasks          break it down   -> tasks.md
/speckit.analyze        cross-check the artifacts
/speckit.implement      do the work

Each phase gates the next. You cannot /speckit.tasks
a feature that has no plan.`,
        },
        {
          name: "specs/",
          dir: true,
          open: true,
          children: [
            {
              name: "001-capture-notes/",
              dir: true,
              open: true,
              fate: "frozen",
              hint: "one branch, one folder",
              note: "Numbering is global, not per-feature: 001 is the first feature in the project, not the first attempt at notes. Folder names are derived from your description by stripping stop words and taking roughly the first three surviving words, which is why you'll reach for --short-name most of the time.",
              children: [
                {
                  name: "spec.md",
                  fate: "frozen",
                  hint: "what & why",
                  note: "Reads like a durable spec. Isn't one. It describes the slice that this branch added, and once the branch merges nobody edits it again.",
                  exampleLang: "markdown",
                  example: `# Feature Specification: Capture Notes

**Branch**: \`001-capture-notes\`
**Status**: Implemented

## User Scenarios

### Primary User Story
A user types into a capture field and the note is saved
without any explicit save action.

### Acceptance Scenarios
1. **Given** an empty capture field, **When** the user types
   text and blurs the field, **Then** a note is persisted.
2. **Given** an empty field, **When** the user blurs it,
   **Then** nothing is persisted.

## Requirements
- **FR-001**: System MUST persist a note on blur.
- **FR-002**: System MUST NOT persist empty notes.

<!-- Six months later, 007-note-pinning/spec.md will also
     describe "how notes work". Neither file wins. -->`,
                },
                {
                  name: "plan.md",
                  fate: "frozen",
                  hint: "how",
                  note: "Technical approach for this slice, generated from the spec and checked against the constitution.",
                },
                {
                  name: "research.md",
                  fate: "frozen",
                  note: "Decisions and alternatives considered during planning.",
                },
                {
                  name: "data-model.md",
                  fate: "frozen",
                  note: "Entities this slice introduces.",
                },
                {
                  name: "contracts/",
                  dir: true,
                  fate: "frozen",
                  note: "API contracts for the slice, used to generate contract tests.",
                },
                {
                  name: "checklists/",
                  dir: true,
                  fate: "frozen",
                  note: "Generated quality gates for the spec itself.",
                },
                {
                  name: "tasks.md",
                  fate: "frozen",
                  hint: "feature-local",
                  note: "The task list lives inside the feature folder, so there is nowhere to express a task that serves three features at once. Shared ORM work has to be adopted by whichever slice needs it first.",
                  exampleLang: "markdown",
                  example: `# Tasks: Capture Notes

- [x] T001 Set up notes module in src/notes/
- [x] T002 [P] Contract test POST /notes
- [x] T003 [P] Contract test GET /notes
- [x] T004 Note model in src/notes/model.ts
- [x] T005 Persist-on-blur handler
- [x] T006 Integration test: empty note rejected

# Note T004. The ORM underneath it also carries tags and
# favourites. There is no file in this repo where that
# fact can be written down.`,
                },
              ],
            },
            {
              name: "002-due-dates-reminders/",
              dir: true,
              fate: "frozen",
              hint: "same shape, never merged",
              note: "This is the problem. Add note pinning six months later and you get 007-note-pinning/ sitting beside 001-capture-notes/. The intent behind notes now lives in two folders that will never reconcile.",
            },
          ],
        },
        {
          name: "CLAUDE.md",
          fate: "durable",
          hint: "agent context",
          note: "Incrementally updated as features land. Durable, but it's agent context rather than a spec.",
        },
        { name: "src/", dir: true, fate: "code" },
      ],
    },
  },
  {
    id: "openspec",
    name: "OpenSpec",
    tagline:
      "Domain specs that accumulate. Changes arrive as deltas and merge in.",
    unit: "A capability, with changes as deltas against it",
    survives:
      "Everything under specs/, plus adr/ and the hand-written journeys",
    verdict:
      "The only one of the four with a durable per-capability document. Increments get folded in and then move out of the way.",
    tree: {
      name: "todo-notes/",
      dir: true,
      open: true,
      children: [
        {
          name: "openspec/",
          dir: true,
          open: true,
          children: [
            {
              name: "project.md",
              fate: "durable",
              hint: "conventions, stack",
              note: "Project-level context every command reads.",
            },
            {
              name: "specs/",
              dir: true,
              open: true,
              fate: "durable",
              hint: "source of truth",
              note: "One folder per capability, organised by domain rather than by increment, which is the layer the other three don't have. This is ./features with a different name.",
              children: [
                {
                  name: "notes/spec.md",
                  fate: "durable",
                  hint: "grows over time",
                  note: "One file, edited forever. Every change that touches notes merges into this file and then gets out of the way. If the code contradicts it, the code has the bug.",
                  exampleLang: "markdown",
                  example: `# notes Specification

## Purpose
Capturing, editing and retrieving the user's notes.

## Requirements

### Requirement: Notes are never hard-deleted
Notes SHALL be archived rather than removed. Archived
notes remain retrievable indefinitely.

#### Scenario: Deleting an archived note
- **WHEN** a user deletes an already-archived note
- **THEN** the note remains retrievable via the archive

### Requirement: Notes persist without explicit save
The capture field SHALL persist its contents on blur.

#### Scenario: Blur with content
\`\`\`gherkin
Given the capture field contains "buy milk"
When the field loses focus
Then a note with body "buy milk" exists
\`\`\`

<!-- Fenced Gherkin stays inside the mergeable structure,
     and can be extracted into real .feature files at
     test time. A sibling journeys.md could not. -->`,
                },
                {
                  name: "notes-search/spec.md",
                  fate: "durable",
                  hint: "flat, not nested",
                  note: "Capabilities are flat today. A nested-path proposal is open, which is only possible because a capability is a directory rather than a file.",
                },
                { name: "todos/spec.md", fate: "durable" },
                { name: "tags/spec.md", fate: "durable" },
              ],
            },
            {
              name: "changes/",
              dir: true,
              open: true,
              children: [
                {
                  name: "add-note-pinning/",
                  dir: true,
                  open: true,
                  fate: "frozen",
                  hint: "in flight",
                  note: "A proposal in progress. Named for the change, not numbered, and not coupled to your branch name.",
                  children: [
                    {
                      name: "proposal.md",
                      fate: "frozen",
                      hint: "why",
                      note: "Why this change, what it touches, what it deliberately doesn't.",
                      exampleLang: "markdown",
                      example: `# Add note pinning

## Why
Users with 200+ notes lose their working set. Pinning
gives a stable top-of-list without a folder hierarchy.

## What Changes
- **notes**: pinned flag, pinned-first ordering
- **notes-search**: pinned results are NOT boosted

## Impact
Affected specs: notes, notes-search
Affected code: src/notes/, src/search/rank.ts`,
                    },
                    {
                      name: "design.md",
                      fate: "frozen",
                      hint: "optional",
                      note: "Technical design, only when the change warrants one.",
                    },
                    {
                      name: "tasks.md",
                      fate: "frozen",
                      hint: "spans capabilities",
                      note: "Unlike Spec Kit's, this isn't tied to one capability. A change names every spec it affects, so shared ORM work can be its own change serving notes, tags and favourites at once. What's missing is a view across changes in flight, and any way to order them.",
                    },
                    {
                      name: "specs/notes/spec.md",
                      fate: "frozen",
                      hint: "delta only, not a copy",
                      note: "A change's spec file holds only what changes, under ADDED / MODIFIED / REMOVED headings. On archive, ADDED appends to the real spec, MODIFIED replaces the requirement, REMOVED deletes it, which is what lets increments accumulate instead of scattering.",
                      exampleLang: "markdown",
                      example: `## ADDED Requirements

### Requirement: Notes can be pinned
A note SHALL be pinnable. Pinned notes sort above
unpinned notes regardless of date.

#### Scenario: Pinning a note
- **WHEN** a user pins a note
- **THEN** it appears above all unpinned notes

## MODIFIED Requirements

### Requirement: Default note ordering
Notes SHALL be ordered pinned-first, then by updated
date descending.

## REMOVED Requirements

### Requirement: Notes are ordered by creation date
**Reason**: superseded by updated-date ordering`,
                    },
                  ],
                },
                {
                  name: "archive/2026-03-14-add-notes-capture/",
                  dir: true,
                  fate: "frozen",
                  hint: "merged, date-prefixed",
                  note: "Once merged, the change folder moves here with a date prefix. Still readable as history, but it is no longer the record. specs/notes/spec.md is.",
                },
              ],
            },
            {
              name: "schemas/",
              dir: true,
              fate: "tooling",
              hint: "redefine the artifacts",
              note: "The artifact shapes themselves are configurable, which is unusual among the four.",
            },
          ],
        },
        {
          name: "adr/",
          dir: true,
          fate: "durable",
          hint: "outlives changes",
          note: "Architecture decisions sit outside the change lifecycle entirely, because a decision doesn't stop being true when the change that prompted it archives.",
        },
        {
          name: "acceptance-tests/",
          dir: true,
          open: true,
          children: [
            {
              name: "journeys/*.feature",
              fate: "durable",
              hint: "hand-written, cross-capability",
              note: "The journeys that span notes and tags and todos at once. No single capability spec can own them, so they live in the test tree instead.",
              exampleLang: "gherkin",
              example: `Feature: Triage the inbox

  # Spans notes, tags and todos, so it belongs to no
  # single capability spec.

  Scenario: Tagging a captured note creates a todo
    Given I have captured a note "call the plumber"
    When I tag it "#todo"
    Then a todo "call the plumber" exists
    And the note links to that todo
    And archiving the note archives the todo`,
            },
            {
              name: ".extracted/",
              dir: true,
              fate: "scratch",
              hint: "from spec.md, gitignored",
              note: "Gherkin lifted out of the capability specs at test time. Generated, never edited.",
            },
          ],
        },
        { name: "src/", dir: true, fate: "code" },
      ],
    },
  },
  {
    id: "superpowers",
    name: "Superpowers",
    tagline:
      "Not a spec framework at all. An engineering culture shipped as skills.",
    unit: "A task, in its own worktree",
    survives: "CLAUDE.md. That's it.",
    verdict:
      "Spec-first taken to its conclusion. It leaves nothing behind and takes no position on what a spec is, which is why it stacks on top of any of the other three.",
    tree: {
      name: "todo-notes/",
      dir: true,
      open: true,
      children: [
        {
          name: "docs/plans/",
          dir: true,
          open: true,
          fate: "scratch",
          hint: "flat, dated, disposable",
          note: "The entire artifact surface: one flat directory of dated plans. There's an open request to make the location configurable, on the grounds that plans are personal working documents rather than project artifacts, which tells you how its own users read them.",
          children: [
            {
              name: "2026-03-14-notes-capture-design.md",
              fate: "scratch",
              note: "The design conversation, written down before the plan.",
            },
            {
              name: "2026-03-14-notes-capture.md",
              fate: "scratch",
              hint: "2–5 min steps, exact paths",
              note: "Written to be executable by an agent with no context at all. Exact paths, literal commands, and “run it and watch it fail” as a real step. Then the branch merges and nobody reads it again.",
              exampleLang: "markdown",
              example: `## Task 3: Persist on blur

**Files**: src/notes/CaptureField.tsx,
           src/notes/CaptureField.test.tsx

### Step 1 — write the failing test
Add to CaptureField.test.tsx:

    it("persists on blur", async () => {
      const save = vi.fn()
      render(<CaptureField onSave={save} />)
      await user.type(screen.getByRole("textbox"), "buy milk")
      await user.tab()
      expect(save).toHaveBeenCalledWith("buy milk")
    })

Run: \`npm test -- CaptureField\`
**Expect it to FAIL** with "save is not a function".
Do not continue until you have seen it fail.

### Step 2 — implement
Add onBlur to the textarea. Run the same command.
Expect PASS.`,
            },
            {
              name: "2026-05-20-note-pinning.md",
              fate: "scratch",
              note: "Two months later, a completely unrelated file in the same flat folder. Nothing connects it to the notes plan above.",
            },
          ],
        },
        {
          name: ".claude/skills/",
          dir: true,
          open: true,
          fate: "tooling",
          hint: "the actual product",
          note: "The skills are the thing you're installing. They govern how the agent works rather than what it writes down.",
          children: [
            {
              name: "using-superpowers/",
              dir: true,
              fate: "tooling",
              hint: "master, gates the rest",
              note: "The entry point every other skill is dispatched from.",
            },
            {
              name: "brainstorming/",
              dir: true,
              fate: "tooling",
              note: "Interrogate the idea before any plan exists.",
            },
            {
              name: "using-git-worktrees/",
              dir: true,
              fate: "tooling",
              note: "Each task gets an isolated worktree, so an abandoned attempt costs nothing.",
            },
            {
              name: "writing-plans/",
              dir: true,
              fate: "tooling",
              hint: "the one to drop",
              note: "The skill that produces docs/plans/. If you're pairing this with OpenSpec, drop it, since OpenSpec's tasks.md already does this job, and keeping both means two task lists.",
            },
            {
              name: "test-driven-development/",
              dir: true,
              fate: "tooling",
              hint: "code before test gets deleted",
              note: "Code written before its test is deleted, on the grounds that a test written afterwards only proves the code does what it does.",
              exampleLang: "text",
              example: `RED    write the test. run it. watch it fail.
              a test you haven't seen fail proves nothing.

GREEN  the minimum that passes. no extra.

REFACTOR  now, with the test holding you.

If implementation was written before its test:
  delete the implementation.
  This is not negotiable and not a metaphor.`,
            },
            {
              name: "requesting-code-review/",
              dir: true,
              fate: "tooling",
              note: "Review by a fresh agent with no memory of writing the code.",
            },
            {
              name: "verification-before-completion/",
              dir: true,
              fate: "tooling",
              hint: "green tests aren't proof",
              note: "Refuses to accept a passing test suite as evidence that the work is done. The claim has to be checked against the actual requirement.",
            },
            {
              name: "finishing-a-development-branch/",
              dir: true,
              fate: "tooling",
              note: "Merge, then tear the worktree down.",
            },
          ],
        },
        {
          name: "CLAUDE.md",
          fate: "durable",
          hint: "the only survivor",
          note: "Genuinely the only thing left over. The plans and the worktree are both disposable on purpose.",
        },
        { name: "src/", dir: true, fate: "code" },
        {
          name: "../todo-notes-worktrees/note-pinning/",
          dir: true,
          fate: "scratch",
          hint: "discarded on finish",
          note: "Outside the repo entirely. Created per task, deleted when the branch finishes.",
        },
      ],
    },
  },
  {
    id: "bmad",
    name: "BMAD",
    tagline:
      "Simulates an agile team. Analyst, PM, architect, SM, dev, test architect.",
    unit: "A story, nested under an epic",
    survives: "project-context.md, docs/, and sprint-status.yaml",
    verdict:
      "Epics are planning slices, so it lands where Spec Kit does. But sprint-status.yaml is the only file in any of these four repos holding state across every feature at once.",
    tree: {
      name: "todo-notes/",
      dir: true,
      open: true,
      children: [
        {
          name: "_bmad/",
          dir: true,
          fate: "tooling",
          hint: "engine, agents, workflows",
          note: "Thirty-odd workflows in the dev module alone. This is a lot of machinery for a small project.",
          children: [
            {
              name: "_cfg/manifest.yaml",
              fate: "tooling",
              hint: "version, modules",
              note: "Which modules are installed and at what version. The tree has been restructured across recent releases, so this matters.",
            },
            {
              name: "core/",
              dir: true,
              fate: "tooling",
              note: "The orchestration engine the agents run on.",
            },
            {
              name: "bmm/",
              dir: true,
              fate: "tooling",
              children: [
                {
                  name: "config.yaml",
                  fate: "tooling",
                  hint: "all output paths",
                  note: "Every output path in one file, which is useful, because the paths aren't fully reconciled between workflows. Some write to docs/, others read from _bmad-output/.",
                },
                {
                  name: "agents/",
                  dir: true,
                  fate: "tooling",
                  hint: "pm, architect, sm, dev…",
                  note: "Each role is a persona with its own workflows and its own idea of what it's allowed to touch.",
                },
                {
                  name: "workflows/",
                  dir: true,
                  fate: "tooling",
                  hint: "1-analysis … 4-implementation",
                  note: "Numbered phases, from analysis through implementation.",
                },
              ],
            },
            {
              name: "bmb/  cis/",
              dir: true,
              fate: "tooling",
              hint: "builder, creative",
              note: "Module builder and creative-ideation modules, shipped alongside.",
            },
          ],
        },
        {
          name: "_bmad-output/",
          dir: true,
          open: true,
          children: [
            {
              name: "project-context.md",
              fate: "durable",
              hint: "read by every agent",
              note: "Shared context every persona loads. Durable, but it's context rather than a specification of any one capability.",
            },
            {
              name: "planning-artifacts/",
              dir: true,
              open: true,
              fate: "frozen",
              children: [
                {
                  name: "prd.md",
                  fate: "frozen",
                  hint: "written once, up front",
                  note: "A product requirements document for the project as it was understood at planning time. Nothing folds later work back into it.",
                },
                {
                  name: "architecture.md",
                  fate: "frozen",
                  note: "The architect persona's output, produced during planning.",
                },
                {
                  name: "epics.md",
                  fate: "frozen",
                  note: "The full epic list, before sharding.",
                },
                {
                  name: "epics/epic-1-notes-capture.md",
                  fate: "frozen",
                  hint: "sharded for tokens",
                  note: "BMAD lands where Spec Kit does. This describes a chunk of work, not what notes is meant to be. Epics are planning slices.",
                  exampleLang: "markdown",
                  example: `# Epic 1: Notes Capture

**Goal**: A user can capture a note in under two seconds
without thinking about saving.

## Stories
- 1.1 Quick capture field
- 1.2 Persist on blur
- 1.3 Capture from keyboard shortcut

## Out of scope
Pinning, tagging, search.

# Epic 4 will be "Note Organisation" and will also
# change how notes behave. Neither file is the spec
# for notes. There isn't one.`,
                },
              ],
            },
            {
              name: "implementation-artifacts/",
              dir: true,
              open: true,
              children: [
                {
                  name: "sprint-status.yaml",
                  fate: "durable",
                  hint: "living dashboard, the reason to look",
                  note: "A single living file tracking every story across every epic, with real tooling built on top of it. That's much closer to a cross-feature ./tasks queue than a tasks.md buried inside one feature's folder, and it's the reason to look at BMAD.",
                  exampleLang: "yaml",
                  example: `generated: 2026-09-01T09:14:02Z
development_status:
  1-1-quick-capture-field: done
  1-2-persist-on-blur: done
  1-3-capture-shortcut: in-progress
  2-1-tag-parser: ready-for-dev
  2-2-tag-index: backlog
  3-1-orm-migration-runner: in-progress   # serves 1, 2 and 4

# One file. Every story. Every epic. Nothing else in
# any of these four frameworks holds state across
# the whole project at once.`,
                },
                {
                  name: "stories/1.1.quick-capture-field.md",
                  fate: "frozen",
                  hint: "the unit of work",
                  note: "A story carries its own context, acceptance criteria and dev notes, so the dev persona can execute it without loading the whole PRD.",
                  exampleLang: "markdown",
                  example: `# Story 1.1: Quick capture field

Status: done

## Story
**As a** user,
**I want** a capture field focused on load,
**so that** I can write a note without clicking first.

## Acceptance Criteria
1. Field is focused on mount
2. Escape clears without saving

## Dev Agent Record
- Implemented src/notes/CaptureField.tsx
- Tests: CaptureField.test.tsx (4 passing)`,
                },
                { name: "stories/1.2.persist-on-blur.md", fate: "frozen" },
              ],
            },
          ],
        },
        {
          name: "docs/",
          dir: true,
          fate: "durable",
          hint: "project_knowledge",
          note: "General project knowledge, outside the epic/story lifecycle.",
        },
        {
          name: ".claude/commands/",
          dir: true,
          fate: "tooling",
          hint: "/bmad-bmm-*",
          note: "One command per persona workflow.",
        },
        { name: "src/", dir: true, fate: "code" },
      ],
    },
  },
];
