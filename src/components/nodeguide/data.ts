// Shared data for the interactive Node.js 22/24/26 guide components.
// Condensed from nodejs-deep-research-report.md (23 Aug 2026 snapshot).

export type NodeVersion = 22 | 24 | 26;

export const VERSION_COLOR: Record<NodeVersion, string> = {
  22: "#4f46e5",
  24: "#16a34a",
  26: "#ea580c",
};

export const VERSION_LABEL: Record<NodeVersion, string> = {
  22: "Node 22 (Jod)",
  24: "Node 24 (Krypton)",
  26: "Node 26",
};

export const VERSION_STATUS: Record<NodeVersion, string> = {
  22: "LTS",
  24: "Latest LTS",
  26: "Current (LTS \u2248 Oct 2026)",
};

export type Support = "yes" | "partial" | "no";

export interface Feature {
  id: string;
  category: string;
  name: string;
  status: Record<NodeVersion, { support: Support; note: string }>;
  detail: string;
  code?: string;
}

export const CATEGORIES = [
  "Module system",
  "TypeScript",
  "Web APIs & networking",
  "Testing",
  "Security & permissions",
  "Performance & diagnostics",
  "Packaging & native addons",
] as const;

export const FEATURES: Feature[] = [
  {
    id: "require-esm",
    category: "Module system",
    name: "Synchronous require(esm)",
    status: {
      22: { support: "yes", note: "flagless from 22.12, quiet from 22.13" },
      24: { support: "yes", note: "inherited, unchanged" },
      26: { support: "yes", note: "inherited, unchanged" },
    },
    detail:
      "CommonJS can require() an ESM module as long as its whole dependency graph is synchronous (no top-level await). It returns a module namespace object, not a default export, unless the package opts into the special module.exports interop.",
    code: "const { square } = require('./math.mjs');",
  },
  {
    id: "import-meta-main",
    category: "Module system",
    name: "import.meta.main",
    status: {
      22: { support: "partial", note: "backported in 22.18" },
      24: { support: "yes", note: "introduced in 24.2" },
      26: { support: "yes", note: "stable" },
    },
    detail:
      "Lets a module detect whether it was the entry point Node was launched with, without the classic require.main === module dance.",
    code: "if (import.meta.main) {\n  runCli();\n}",
  },
  {
    id: "module-register",
    category: "Module system",
    name: "module.register() loader hooks",
    status: {
      22: { support: "yes", note: "stable, asynchronous hooks" },
      24: { support: "yes", note: "stable, asynchronous hooks" },
      26: {
        support: "partial",
        note: "runtime-deprecated in favour of registerHooks()",
      },
    },
    detail:
      "v26 nudges custom loaders toward module.registerHooks(), a synchronous, in-thread hook system. It isn't a drop-in rename: async loader semantics differ, so test resolution, loading and transform behaviour before you rely on it.",
  },
  {
    id: "import-assertions",
    category: "Module system",
    name: "Import attributes (not assertions)",
    status: {
      22: {
        support: "yes",
        note: "old assert{} syntax dropped, attributes only",
      },
      24: { support: "yes", note: "unchanged" },
      26: { support: "yes", note: "unchanged" },
    },
    detail:
      "The old `assert { type: 'json' }` import-assertion syntax stopped working in v22. JSON modules and import attributes lost experimental status in 22.12.",
    code: "import data from './x.json' with { type: 'json' };",
  },
  {
    id: "ts-stripping-available",
    category: "TypeScript",
    name: "Built-in type stripping available",
    status: {
      22: { support: "yes", note: "from 22.6" },
      24: { support: "yes", note: "inherited" },
      26: { support: "yes", note: "inherited" },
    },
    detail:
      "Node can run .ts files directly by erasing type-only syntax before execution. It performs no type checking and ignores tsconfig.json. It's not a TypeScript compiler.",
    code: "node app.ts",
  },
  {
    id: "ts-stripping-default",
    category: "TypeScript",
    name: "Type stripping on by default",
    status: {
      22: { support: "yes", note: "from 22.18" },
      24: { support: "yes", note: "inherited" },
      26: { support: "yes", note: "inherited" },
    },
    detail: "No flag needed and no experimental warning once you're on 22.18+.",
  },
  {
    id: "ts-stripping-stable",
    category: "TypeScript",
    name: "Type stripping marked stable",
    status: {
      22: { support: "no", note: "still transitional on this line" },
      24: { support: "yes", note: "from 24.12" },
      26: { support: "yes", note: "stable" },
    },
    detail:
      '"Stable" describes the runtime facility itself, not feature parity with tsc. tsconfig.json is still ignored and there is still no type checking.',
  },
  {
    id: "transform-types",
    category: "TypeScript",
    name: "--experimental-transform-types",
    status: {
      22: { support: "yes", note: "from 22.7" },
      24: { support: "partial", note: "present, but transitional" },
      26: { support: "no", note: "removed" },
    },
    detail:
      "The flag that let Node generate JS for TypeScript-only syntax (e.g. enums) is gone in v26. The supported model is now erasable-syntax-only. Rewrite that code, or keep using tsc/tsx.",
  },
  {
    id: "websocket",
    category: "Web APIs & networking",
    name: "Global WebSocket client",
    status: {
      22: { support: "yes", note: "on by default" },
      24: { support: "yes", note: "unchanged" },
      26: { support: "yes", note: "unchanged" },
    },
    detail:
      "A browser-compatible WebSocket client, no ws package required for the simple cases (no reconnection/server support).",
    code: "const s = new WebSocket('wss://example.com');",
  },
  {
    id: "urlpattern",
    category: "Web APIs & networking",
    name: "Global URLPattern",
    status: {
      22: { support: "no", note: "not available" },
      24: { support: "yes", note: "global from 24.0" },
      26: { support: "yes", note: "unchanged" },
    },
    detail:
      "A standards-based URL-aware matcher for routing, instead of hand-rolled regular expressions.",
    code: "new URLPattern({ pathname: '/users/:id' })\n  .exec('https://x.com/users/42');",
  },
  {
    id: "temporal",
    category: "Web APIs & networking",
    name: "Temporal enabled by default",
    status: {
      22: { support: "no", note: "not available" },
      24: { support: "no", note: "not available" },
      26: { support: "yes", note: "global, no flag" },
    },
    detail:
      "First-class date/time with real timezones, DST-aware arithmetic, immutable values and calendar support. The clearest v26-only reason among the three lines.",
    code: "Temporal.ZonedDateTime.from('2026-10-25T09:30[Europe/London]')\n  .add({ hours: 3 });",
  },
  {
    id: "undici",
    category: "Web APIs & networking",
    name: "Undici (fetch/HTTP client) generation",
    status: {
      22: { support: "partial", note: "earlier major" },
      24: { support: "yes", note: "Undici 7" },
      26: { support: "yes", note: "Undici 8.0.2" },
    },
    detail:
      "Each major line ships a newer Undici generation. Applications leaning on edge-case fetch/streams/pooling behaviour should integration-test across an Undici major bump.",
  },
  {
    id: "subtest-wait",
    category: "Testing",
    name: "Auto-waiting node:test subtests",
    status: {
      22: { support: "no", note: "parent doesn't auto-wait" },
      24: { support: "yes", note: "breaking semantic change" },
      26: { support: "yes", note: "unchanged" },
    },
    detail:
      "Parents now automatically wait for t.test() children, removing a common detached-subtest bug. But code that did `return t.test(...).then(...)` needs rewriting.",
    code: "test('parent', t => {\n  t.test('child', () => assert.equal(2 + 2, 4));\n  // parent waits automatically\n});",
  },
  {
    id: "test-randomization",
    category: "Testing",
    name: "Test execution randomisation",
    status: {
      22: { support: "no", note: "not available" },
      24: { support: "no", note: "not available" },
      26: { support: "yes", note: "from 26.1" },
    },
    detail: "Helps surface ordering assumptions hiding in a test suite.",
  },
  {
    id: "permission-model",
    category: "Security & permissions",
    name: "Permission Model stable",
    status: {
      22: { support: "yes", note: "from 22.13" },
      24: { support: "yes", note: "unchanged" },
      26: { support: "yes", note: "unchanged" },
    },
    detail:
      '`--permission --allow-fs-read=...` etc. Node explicitly calls this a "seat belt", not a sandbox for hostile code. OS-level isolation is still necessary for untrusted code.',
    code: "node --permission --allow-fs-read=/etc/myapp app.js",
  },
  {
    id: "permission-drop",
    category: "Security & permissions",
    name: "process.permission.drop()",
    status: {
      22: { support: "no", note: "not available" },
      24: { support: "no", note: "not available" },
      26: { support: "yes", note: "from 26.3" },
    },
    detail:
      "Irreversibly relinquish a previously granted permission at runtime. Only affects future checks; already-open fds/sockets/workers stay open.",
    code: "process.permission.drop('fs.read', '/etc/myapp');",
  },
  {
    id: "gcm-tags",
    category: "Security & permissions",
    name: "Short AES-GCM tags without authTagLength",
    status: {
      22: { support: "yes", note: "legacy behaviour still allowed" },
      24: { support: "yes", note: "legacy behaviour still allowed" },
      26: { support: "no", note: "compatibility exception removed" },
    },
    detail:
      "Code using short GCM auth tags must now explicitly declare authTagLength.",
  },
  {
    id: "maglev",
    category: "Performance & diagnostics",
    name: "V8 Maglev tier-up (supported archs)",
    status: {
      22: { support: "yes", note: "enabled from 22.0" },
      24: { support: "yes", note: "inherited" },
      26: { support: "yes", note: "inherited" },
    },
    detail: "Faster tier-up helps short-lived workloads and CLIs the most.",
  },
  {
    id: "compile-cache",
    category: "Performance & diagnostics",
    name: "Module compile cache",
    status: {
      22: { support: "yes", note: "introduced 22.1, API from 22.8" },
      24: { support: "yes", note: "portable mode from 24.12" },
      26: { support: "yes", note: "mature/current API" },
    },
    detail:
      "Persists V8 code cache across restarts. First run is slower; later runs of an unchanged module graph get faster. Disable it for precise coverage runs.",
    code: "import { enableCompileCache } from 'node:module';\nenableCompileCache();",
  },
  {
    id: "async-context-frame",
    category: "Performance & diagnostics",
    name: "AsyncLocalStorage \u2192 AsyncContextFrame",
    status: {
      22: { support: "no", note: "older implementation" },
      24: { support: "yes", note: "new default implementation" },
      26: { support: "yes", note: "inherited" },
    },
    detail:
      "A more efficient, robust implementation behind AsyncLocalStorage. Matters most to tracing/telemetry/request-context frameworks built on it.",
  },
  {
    id: "buffer-pool",
    category: "Performance & diagnostics",
    name: "Buffer.poolSize default",
    status: {
      22: { support: "partial", note: "smaller legacy default" },
      24: { support: "partial", note: "smaller legacy default" },
      26: { support: "yes", note: "raised to 64 KiB in 26.3" },
    },
    detail:
      "Can change allocation/memory characteristics for apps making many small Buffer allocations. Benchmark rather than assume it's a pure win.",
  },
  {
    id: "module-version",
    category: "Packaging & native addons",
    name: "NODE_MODULE_VERSION (native ABI)",
    status: {
      22: { support: "partial", note: "127" },
      24: { support: "partial", note: "137" },
      26: { support: "partial", note: "147" },
    },
    detail:
      "Every major changes this. Node-API addons are built for ABI stability across versions; direct V8/Node C++ addons are not and often need a rebuild.",
  },
  {
    id: "corepack",
    category: "Packaging & native addons",
    name: "Corepack bundled with Node",
    status: {
      22: { support: "yes", note: "bundled" },
      24: { support: "yes", note: "bundled" },
      26: { support: "no", note: "removed from the distribution" },
    },
    detail:
      "Corepack ships with Node from 14.19 up to, but not including, 25.0. A `corepack enable` step in CI/Dockerfiles that relied on the bundle will fail on v26 images unless installed explicitly.",
  },
  {
    id: "sea",
    category: "Packaging & native addons",
    name: "Direct node --build-sea",
    status: {
      22: { support: "no", note: "manual blob injection required" },
      24: { support: "no", note: "manual blob injection required" },
      26: { support: "yes", note: "inherited from 25.5" },
    },
    detail:
      "Builds a single-executable application directly, instead of generating a preparation blob and injecting it into a copy of the Node binary yourself.",
    code: "node --build-sea sea-config.json",
  },
];

export interface TimelineEvent {
  date: string;
  version: NodeVersion | "now";
  title: string;
  bullets: string[];
}

export const TIMELINE: TimelineEvent[] = [
  {
    date: "2024-04-24",
    version: 22,
    title: "Node 22.0.0 ships",
    bullets: [
      "V8 12.4, Maglev enabled on supported architectures",
      "Global WebSocket client enabled by default",
      "Synchronous require(esm) introduced (behind a flag)",
      "Watch mode marked stable, node --run added, fs.glob() added",
    ],
  },
  {
    date: "2024\u20132025",
    version: 22,
    title: "The v22 line matures",
    bullets: [
      "22.6: built-in TypeScript type stripping arrives",
      "22.12: require(esm) becomes flagless",
      "22.13: Permission Model marked stable; require(esm) stops warning",
      "22.18: type stripping enabled by default; import.meta.main backported",
    ],
  },
  {
    date: "2025-05-06",
    version: 24,
    title: "Node 24.0.0 ships",
    bullets: [
      "V8 13.6: Float16Array, explicit resource management, RegExp.escape(), Error.isError()",
      "npm bumped to major 11",
      "Global URLPattern; AsyncLocalStorage moves to AsyncContextFrame",
      "node:test subtests now auto-waited (breaking semantic change)",
    ],
  },
  {
    date: "2025\u20132026",
    version: 24,
    title: "The v24 line matures",
    bullets: [
      "24.2: import.meta.main lands on this line too",
      "24.12: built-in TypeScript type stripping becomes stable",
      "24.12: module compile cache gains a portable mode",
    ],
  },
  {
    date: "2026-05-05",
    version: 26,
    title: "Node 26.0.0 ships",
    bullets: [
      "Temporal enabled globally by default",
      "V8 14.6: Map/WeakMap upsert methods, Iterator.concat()",
      "Undici 8.0.2; --experimental-transform-types removed",
      "Corepack no longer bundled; legacy _stream_* modules removed",
    ],
  },
  {
    date: "2026",
    version: 26,
    title: "The v26 line so far",
    bullets: [
      "26.1: test execution randomisation",
      "26.3: process.permission.drop(), Buffer.poolSize raised to 64 KiB, WebCrypto hardening",
      "26.7: --test-coverage-include-all, Perfetto diagnostics support",
    ],
  },
  {
    date: "2026-08-23",
    version: "now",
    title: "Where things stand today",
    bullets: [
      'Node 22 ("Jod"): LTS',
      'Node 24 ("Krypton"): latest LTS, the default production choice',
      "Node 26: Current, scheduled to enter LTS in October 2026",
    ],
  },
];

export interface Priority {
  id: string;
  label: string;
  weight: Record<NodeVersion, number>;
  reason: Record<NodeVersion, string | null>;
}

export const PRIORITIES: Priority[] = [
  {
    id: "stability",
    label: "Minimise migration risk over new features",
    weight: { 22: 2, 24: 2, 26: -3 },
    reason: {
      22: "Already validated, fewest moving parts left to break.",
      24: "LTS with a smaller migration surface than 26.",
      26: null,
    },
  },
  {
    id: "lts",
    label: "I need a Long-Term-Support (LTS) line",
    weight: { 22: 1, 24: 3, 26: -3 },
    reason: {
      22: "LTS, but an older LTS than 24.",
      24: "The latest LTS line, so support runs longest from here.",
      26: "Still Current status; LTS not expected until October 2026.",
    },
  },
  {
    id: "temporal",
    label: "I want modern Temporal date/time handling",
    weight: { 22: -1, 24: -1, 26: 3 },
    reason: {
      22: null,
      24: null,
      26: "The only line with Temporal enabled globally by default.",
    },
  },
  {
    id: "corepack",
    label: "CI relies on Corepack being bundled (Yarn/pnpm)",
    weight: { 22: 1, 24: 1, 26: -3 },
    reason: {
      22: "Corepack ships with Node here.",
      24: "Corepack ships with Node here.",
      26: "Corepack was removed. Install it explicitly, or your `corepack enable` step breaks.",
    },
  },
  {
    id: "native-addons",
    label: "I depend on non-Node-API native addons",
    weight: { 22: 2, 24: 1, 26: -2 },
    reason: {
      22: "You've likely already rebuilt for ABI 127; fewer future rebuilds needed if you stay put.",
      24: "One ABI bump already absorbed (137).",
      26: "Yet another ABI bump (147) on top of everything else changing.",
    },
  },
  {
    id: "ts-stable",
    label: "I want stable built-in TypeScript execution",
    weight: { 22: -1, 24: 2, 26: 2 },
    reason: {
      22: "Type stripping exists but is still transitional on this line.",
      24: "Stable from 24.12, the first line where it's a supported guarantee.",
      26: "Stable, and the erasable-only model is now the only model.",
    },
  },
  {
    id: "sea",
    label: "I want to ship a single-executable binary easily",
    weight: { 22: -1, 24: -1, 26: 3 },
    reason: {
      22: null,
      24: null,
      26: "node --build-sea builds the executable directly; earlier lines need manual blob injection.",
    },
  },
  {
    id: "security",
    label: "I want the newest runtime security controls",
    weight: { 22: -1, 24: 0, 26: 2 },
    reason: {
      22: null,
      24: "Permission Model is stable and mainstream here.",
      26: "Adds process.permission.drop() and WebCrypto hardening on top.",
    },
  },
  {
    id: "greenfield",
    label: "Brand-new project, evaluating the newest baseline",
    weight: { 22: -2, 24: 0, 26: 3 },
    reason: {
      22: null,
      24: "A safe, modern, boring default.",
      26: "Technically the most capable line, if you can tolerate Current status.",
    },
  },
];

export interface MigrationStep {
  id: string;
  title: string;
  detail: string;
  code?: string;
}

export const MIGRATION_22_TO_24: MigrationStep[] = [
  {
    id: "m1",
    title: "Run the full test suite under v24 before changing code",
    detail:
      "node:test now auto-waits subtests. Code that did `return t.test(...).then(...)` or otherwise assumed a promise-like return needs rewriting.",
  },
  {
    id: "m2",
    title: "Clean up deprecated/removed core APIs",
    detail:
      "Prioritise tls.createSecurePair/SecurePair, url.parse, dirent.path, fd-based fs.truncate, direct fs.F_OK-style constants, SlowBuffer, and zlib/REPL construction without new.",
  },
  {
    id: "m3",
    title: "Audit shell: true usage in spawn/execFile",
    detail:
      "Node's deprecation exists because of a real shell-injection hazard when args contains untrusted input.",
    code: "spawn(command, args, { shell: true }); // audit this",
  },
  {
    id: "m4",
    title: "Validate npm 10 \u2192 npm 11 behaviour",
    detail:
      "Dependency resolution, lockfiles, lifecycle scripts and CI caching should be tested, not assumed equivalent.",
  },
  {
    id: "m5",
    title: "Rebuild/verify non-Node-API native addons",
    detail:
      "ABI moves from 127 to 137. Node-API addons are far more likely to just work.",
  },
  {
    id: "m6",
    title: "Target 24.12+ if you need stable built-in TypeScript",
    detail:
      "Not all Node 24 releases are equivalent. Stability lands specifically at 24.12.",
  },
];

export const MIGRATION_24_TO_26: MigrationStep[] = [
  {
    id: "m7",
    title: "Install Corepack explicitly in CI/Docker images",
    detail:
      "`corepack enable` alone will fail on v26 because Corepack is no longer bundled with Node.",
    code: "npm install -g corepack\ncorepack enable",
  },
  {
    id: "m8",
    title: "Remove --experimental-transform-types usage",
    detail:
      "It's removed in v26. Rewrite to erasable TypeScript, or keep an explicit tsc/tsx transpile step.",
  },
  {
    id: "m9",
    title: "Migrate custom ESM loaders off module.register()",
    detail:
      "It's runtime-deprecated in favour of module.registerHooks(). The newer hooks are synchronous/in-thread, so test resolution, loading and worker interaction. Don't assume a blind rename.",
  },
  {
    id: "m10",
    title: "Replace removed legacy APIs",
    detail:
      "http.Server.prototype.writeHeader() is removed (use writeHead()); the private _stream_* modules are removed entirely.",
    code: "server.writeHeader(...); // removed\nserver.writeHead(...);   // use this",
  },
  {
    id: "m11",
    title: "Add explicit authTagLength for short AES-GCM tags",
    detail:
      "The compatibility exception for short GCM auth tags without an explicit length is gone.",
  },
  {
    id: "m12",
    title: "Rebuild/verify native addons again",
    detail:
      "ABI moves from 137 to 147. Same Node-API vs. direct-binding risk profile as any major bump.",
  },
  {
    id: "m13",
    title: "Update source-build toolchains",
    detail:
      "GCC minimum becomes 13.2 and Python 3.9 source-build support is dropped. Relevant if you build Node yourself.",
  },
  {
    id: "m14",
    title: "Regenerate performance baselines",
    detail:
      "V8/Undici generations changed and Buffer.poolSize is now 64 KiB by default. Benchmark startup, steady-state latency, throughput and RSS. Don't infer from the version number.",
  },
];

export const PITFALLS: { symptom: string; cause: string; action: string }[] = [
  {
    symptom: "require() fails for an ESM dependency",
    cause: "The ESM graph contains top-level await",
    action:
      "Switch that boundary to await import(); sync require(esm) deliberately excludes async graphs.",
  },
  {
    symptom: ".js unexpectedly interpreted as ESM",
    cause: "v22+ syntax detection plus ambiguous package metadata",
    action: 'Add explicit "type": "module" or "type": "commonjs".',
  },
  {
    symptom: "Native package fails with a \u2018module version\u2019 mismatch",
    cause: "ABI changed 127 \u2192 137 \u2192 147",
    action: "Rebuild the matching binary, or migrate the addon to Node-API.",
  },
  {
    symptom: ".ts works but compiler path aliases don't",
    cause: "Node ignores tsconfig.json entirely",
    action:
      "Use plain relative imports, or add a real TypeScript loader/build step.",
  },
  {
    symptom:
      "Nested node:test abstraction behaves differently after 22\u219224",
    cause: "Subtest return/wait semantics changed",
    action:
      "Remove promise assumptions from test wrappers/reporters and retest them.",
  },
  {
    symptom: "corepack: command not found on v26",
    cause: "Corepack is no longer bundled",
    action: "Install Corepack/Yarn/pnpm explicitly in the image or CI job.",
  },
  {
    symptom: "Coverage numbers shift when the compile cache is enabled",
    cause: "Deserialised V8 code can be less precise for coverage",
    action: "Disable the module compile cache for coverage-collecting runs.",
  },
  {
    symptom: "A dropped permission doesn't actually stop anything",
    cause: "permission.drop() only affects future checks",
    action:
      "Explicitly close existing fds/sockets/workers as well as dropping the grant.",
  },
];
