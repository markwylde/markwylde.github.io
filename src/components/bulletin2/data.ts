// Data for the Bulletin part 2 post. All times are UTC on Sunday 15 November
// 2026, which was local time. Sources: the Claude Code session transcript and
// its subagent transcripts, `git log` on markwylde/bulletin, and `gh run list`.

export const COL = {
  me: "#9aa0b6",
  claude: "#e0915a",
  claudeDark: "#b8683a",
  haiku: "#d9b25a",
  good: "#2f9e6b",
  bad: "#d9485f",
  warn: "#c98a1a",
  muted: "#8b93a7",
};

export type Lane = {
  id: string;
  label: string;
  bars: { from: string; to: string; note: string }[];
};

export const LANES: Lane[] = [
  {
    id: "main",
    label: "Orchestrator",
    bars: [
      {
        from: "10:31",
        to: "19:41",
        note: "The main Claude session: planning, reviewing screenshots, gating, merging and answering me. 218 API calls, $14.26.",
      },
    ],
  },
  {
    id: "p0",
    label: "Phase 0",
    bars: [
      {
        from: "10:39",
        to: "10:46",
        note: "Phase 0 subagent: the screenshot tool, the data-* hook guard, a 768 px tablet viewport and self-hosted Inter. 7 minutes, 50 API calls, $2.30.",
      },
    ],
  },
  {
    id: "u",
    label: "Forum UI",
    bars: [
      {
        from: "10:46",
        to: "17:08",
        note: "Forum UI subagent: shell, board index, forum, topic, search, profiles, members, account, conversations, moderation, sign-in pages and the Lounge theme. 6h22m, 720 API calls, $50.33.",
      },
    ],
  },
  {
    id: "s",
    label: "Staff UI",
    bars: [
      {
        from: "10:46",
        to: "16:45",
        note: "Staff UI subagent: the UI kit, icon rail, grouped panel, ⌘K section search, dashboard, then all 38 sections area by area. 5h59m, 637 API calls, $48.15.",
      },
    ],
  },
  {
    id: "pol",
    label: "Polish",
    bars: [
      {
        from: "17:09",
        to: "18:37",
        note: "Polish subagent: three rounds of CI fixes first, then a page-by-page review of both apps and new E2E tests for breadcrumbs and 360 px overflow. 1h28m, 346 API calls, $20.10.",
      },
    ],
  },
  {
    id: "fin",
    label: "Final fixes",
    bars: [
      {
        from: "18:37",
        to: "19:26",
        note: "Final fixes subagent: identicon avatars, a quieter demo tip plugin, post actions pinned to the bottom, the Members crumb, and the display-name E2E race. 49 minutes, 159 API calls, $9.34.",
      },
    ],
  },
];

// One row of CI runs on main. `to` is when the run finished.
export const CI: {
  from: string;
  to: string;
  sha: string;
  result: "success" | "failure" | "cancelled";
  note: string;
}[] = [
  {
    from: "10:52",
    to: "11:07",
    sha: "20e62760",
    result: "success",
    note: "Green before the first merge.",
  },
  {
    from: "14:37",
    to: "14:51",
    sha: "816757d8",
    result: "failure",
    note: "Forum shell merged. Integration tests fail: the gate never ran them.",
  },
  {
    from: "15:32",
    to: "15:49",
    sha: "9e44d0e2",
    result: "failure",
    note: "Staff shell merged. Still red.",
  },
  {
    from: "16:46",
    to: "16:59",
    sha: "dc92d996",
    result: "failure",
    note: "Staff pages merged. Still red.",
  },
  {
    from: "17:09",
    to: "17:25",
    sha: "3a5c6206",
    result: "failure",
    note: "Forum pages merged. Still red.",
  },
  {
    from: "17:46",
    to: "18:02",
    sha: "0c3fa8c2",
    result: "failure",
    note: "CI fix 1. Integration suite green, two browser tests still fail.",
  },
  {
    from: "18:06",
    to: "18:23",
    sha: "8b2c021e",
    result: "failure",
    note: "CI fix 2: the theme chooser 401 during re-auth. One test left.",
  },
  {
    from: "18:25",
    to: "18:38",
    sha: "bffec632",
    result: "cancelled",
    note: "CI fix 3. Cancelled by the next push; every job that finished passed.",
  },
  {
    from: "18:37",
    to: "18:54",
    sha: "c0214cd1",
    result: "failure",
    note: "Polish merged. Two browser tests fail in Chromium.",
  },
  {
    from: "19:26",
    to: "19:41",
    sha: "d52cfbea",
    result: "success",
    note: "Final fixes merged. Green, 4h50m after the first red run.",
  },
];

export const EVENTS: {
  at: string;
  who: "me" | "claude" | "bad" | "good";
  label: string;
}[] = [
  { at: "10:31", who: "me", label: "I ask for a new UI" },
  {
    at: "10:37",
    who: "me",
    label: "I answer six questions. Planning is done at 10:39",
  },
  {
    at: "13:55",
    who: "bad",
    label: "Docker hangs under three 16-service stacks",
  },
  { at: "14:37", who: "good", label: "First merge: the forum shell" },
  { at: "15:42", who: "bad", label: "Docker's disk is full" },
  { at: "16:51", who: "bad", label: "The disk is full again" },
  { at: "17:09", who: "good", label: "Both apps fully rebuilt on main" },
  { at: "19:41", who: "good", label: "CI green on main" },
];

// Token usage per transcript, deduplicated by API message ID. Prices are
// Anthropic API list prices per million tokens: Opus 5.5 $4 input, $5 cache
// write (5 minute), $8 cache write (1 hour), $0.20 cache read, $20 output.
// Haiku 5.5 is $0.10, $0.125, $0.20, $0.01 and $0.50.
export type Usage = {
  id: string;
  label: string;
  model: string;
  calls: number;
  input: number;
  write5m: number;
  write1h: number;
  read: number;
  output: number;
  cost: number;
};

export const USAGE: Usage[] = [
  {
    id: "u",
    label: "Forum UI",
    model: "Opus 5.5",
    calls: 720,
    input: 1496,
    write5m: 2426244,
    write1h: 818,
    read: 152661022,
    output: 382472,
    cost: 50.33,
  },
  {
    id: "s",
    label: "Staff UI",
    model: "Opus 5.5",
    calls: 637,
    input: 1322,
    write5m: 2133318,
    write1h: 818,
    read: 142034038,
    output: 453190,
    cost: 48.15,
  },
  {
    id: "pol",
    label: "Polish + CI fixes",
    model: "Opus 5.5",
    calls: 346,
    input: 708,
    write5m: 473154,
    write1h: 596,
    read: 73472880,
    output: 151695,
    cost: 20.1,
  },
  {
    id: "main",
    label: "Orchestrator",
    model: "Opus 5.5",
    calls: 218,
    input: 560,
    write5m: 0,
    write1h: 428312,
    read: 44799606,
    output: 93505,
    cost: 14.26,
  },
  {
    id: "fin",
    label: "Final fixes",
    model: "Opus 5.5",
    calls: 159,
    input: 328,
    write5m: 200630,
    write1h: 1939,
    read: 34795406,
    output: 68130,
    cost: 9.34,
  },
  {
    id: "p0",
    label: "Phase 0",
    model: "Opus 5.5",
    calls: 50,
    input: 102,
    write5m: 56682,
    write1h: 1114,
    read: 6939192,
    output: 31189,
    cost: 2.3,
  },
  {
    id: "haiku",
    label: "Reading part 1",
    model: "Haiku 5.5",
    calls: 2,
    input: 4,
    write5m: 20875,
    write1h: 0,
    read: 3657,
    output: 6669,
    cost: 0.01,
  },
];

export const PRICES = {
  "Opus 5.5": { input: 4, write5m: 5, write1h: 8, read: 0.2, output: 20 },
  "Haiku 5.5": {
    input: 0.1,
    write5m: 0.125,
    write1h: 0.2,
    read: 0.01,
    output: 0.5,
  },
} as const;
