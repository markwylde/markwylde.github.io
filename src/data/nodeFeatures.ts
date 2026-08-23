export type NodeFeature = {
  slug: string;
  title: string;
  mapLabel: string;
  area:
    | "modules"
    | "typescript"
    | "web"
    | "tooling"
    | "security"
    | "packaging"
    | "compatibility";
  areaLabel: string;
  release: "22" | "24" | "26";
  milestone: string;
  x: number;
  y: number;
  size: "small" | "medium" | "large";
  kind: "landmark" | "harbour" | "fort" | "hazard";
  summary: string;
  impact: string;
  timeline: Array<{ version: string; text: string }>;
  enables: string[];
  limits: string[];
  checks: string[];
  example?: { language: string; code: string };
  sources: Array<{ label: string; url: string }>;
  related: string[];
};

export const nodeFeatures: NodeFeature[] = [
  {
    slug: "require-esm",
    title: "ESM from CommonJS",
    mapLabel: "require(ESM)",
    area: "modules",
    areaLabel: "Modules",
    release: "22",
    milestone: "22.0 to 22.13",
    x: 17,
    y: 24,
    size: "large",
    kind: "landmark",
    summary: "CommonJS can synchronously load eligible ES modules.",
    impact:
      "Older applications can consume many ESM-only packages without converting the whole codebase first.",
    timeline: [
      {
        version: "22.0",
        text: "Introduced behind --experimental-require-module.",
      },
      { version: "22.12", text: "Works without the flag." },
      {
        version: "22.13",
        text: "The experimental warning is hidden by default.",
      },
    ],
    enables: [
      "Load synchronous ESM graphs from CommonJS",
      "Adopt ESM one boundary at a time",
      "Consume .mjs and type=module packages with require()",
    ],
    limits: [
      "Any top-level await in the graph causes ERR_REQUIRE_ASYNC_MODULE",
      "The result is a module namespace object",
      "Syntax detection does not replace explicit package type metadata",
    ],
    checks: [
      "Find CommonJS boundaries that load ESM dependencies",
      "Test for top-level await",
      "Check default and named export assumptions",
      "Set type=module or type=commonjs explicitly",
    ],
    example: {
      language: "js",
      code: "// math.mjs\nexport const square = x => x * x;\n\n// app.cjs, Node 22.12+\nconst { square } = require('./math.mjs');\nconsole.log(square(5));",
    },
    sources: [
      {
        label: "Modules documentation",
        url: "https://nodejs.org/api/modules.html",
      },
      {
        label: "Node 22 release notes",
        url: "https://nodejs.org/en/blog/release/v22.0.0",
      },
    ],
    related: ["native-typescript", "module-compile-cache"],
  },
  {
    slug: "native-typescript",
    title: "Native TypeScript",
    mapLabel: "TypeScript route",
    area: "typescript",
    areaLabel: "TypeScript",
    release: "22",
    milestone: "22.6 to 26",
    x: 27,
    y: 17,
    size: "large",
    kind: "landmark",
    summary:
      "Type stripping starts in 22, stabilises in 24 and narrows to erasable syntax in 26.",
    impact:
      "Scripts, tests and deliberately constrained applications can run .ts files without a runtime transpiler.",
    timeline: [
      { version: "22.6", text: "Type stripping is introduced." },
      { version: "22.18", text: "Stripping is enabled by default." },
      { version: "24.12", text: "Type stripping becomes stable." },
      { version: "26", text: "--experimental-transform-types is removed." },
    ],
    enables: [
      "Run erasable TypeScript directly",
      "Separate runtime execution from static checking",
      "Remove a loader from simple scripts and tests",
    ],
    limits: [
      "Node does not type-check",
      "tsconfig.json and path mappings are ignored",
      "Enums, parameter properties and other emitted syntax still need a transformer",
    ],
    checks: [
      "Inventory non-erasable TypeScript syntax",
      "Check compiler path aliases",
      "Keep tsc --noEmit for static validation",
      "Remove transform-types on Node 26",
    ],
    example: {
      language: "bash",
      code: "# Runtime execution\nnode src/app.ts\n\n# Separate static validation\ntsc --noEmit",
    },
    sources: [
      {
        label: "TypeScript in Node",
        url: "https://nodejs.org/api/typescript.html",
      },
      {
        label: "Node 26 release notes",
        url: "https://nodejs.org/en/blog/release/v26.0.0",
      },
    ],
    related: ["require-esm", "module-compile-cache"],
  },
  {
    slug: "module-compile-cache",
    title: "Module compile cache",
    mapLabel: "Compile cache",
    area: "tooling",
    areaLabel: "Tooling",
    release: "22",
    milestone: "22.1 to 24.12",
    x: 29,
    y: 39,
    size: "medium",
    kind: "landmark",
    summary:
      "Node stores V8 code cache for CommonJS, ESM and TypeScript modules.",
    impact:
      "Repeatedly launched CLIs, workers and applications can spend less time compiling unchanged modules.",
    timeline: [
      { version: "22.1", text: "The on-disk compile cache arrives." },
      { version: "22.8", text: "JavaScript APIs are added." },
      {
        version: "24.12",
        text: "Portable mode can survive a changed project path.",
      },
    ],
    enables: [
      "Cache CommonJS, ESM and TypeScript compilation",
      "Improve warm startup",
      "Reuse caches across moved projects in portable mode",
    ],
    limits: [
      "The first run can be slower",
      "Caches are generally tied to a Node version",
      "Cached code can reduce coverage precision",
    ],
    checks: [
      "Benchmark cold and warm startup",
      "Separate caches by Node version",
      "Disable the cache for precise coverage",
      "Preserve relative layout when using portable mode",
    ],
    example: {
      language: "js",
      code: "import { enableCompileCache } from 'node:module';\n\nenableCompileCache({\n  directory: '/cache/node',\n  portable: true\n});",
    },
    sources: [
      {
        label: "node:module documentation",
        url: "https://nodejs.org/api/module.html",
      },
    ],
    related: ["native-typescript", "node-test-runner"],
  },
  {
    slug: "web-platform-apis",
    title: "Web platform APIs",
    mapLabel: "Web APIs",
    area: "web",
    areaLabel: "Web APIs",
    release: "22",
    milestone: "22 to 26",
    x: 15,
    y: 51,
    size: "medium",
    kind: "harbour",
    summary:
      "WebSocket, URLPattern and newer Undici releases bring browser-style primitives into Node.",
    impact:
      "Straightforward clients and URL matching need fewer dependencies, while the same APIs work across more runtimes.",
    timeline: [
      {
        version: "22",
        text: "The global WebSocket client is enabled by default.",
      },
      {
        version: "24",
        text: "URLPattern becomes global and Undici moves to 7.",
      },
      { version: "26", text: "Undici moves to 8." },
    ],
    enables: [
      "Open basic WebSocket clients without ws",
      "Match routes with URLPattern",
      "Share more Web API knowledge between server and browser",
    ],
    limits: [
      "WebSocket does not provide reconnection or a server",
      "Undici major changes deserve integration testing",
      "url.parse() is deprecated in favour of URL",
    ],
    checks: [
      "Find ws usage that only creates clients",
      "Replace url.parse()",
      "Test fetch, streams, proxy and pooling behavior",
      "Check your minimum runtime before using URLPattern",
    ],
    example: {
      language: "js",
      code: "const users = new URLPattern({ pathname: '/users/:id' });\nconst match = users.exec('https://example.com/users/42');\nconsole.log(match.pathname.groups.id);",
    },
    sources: [
      {
        label: "Node 22 release notes",
        url: "https://nodejs.org/en/blog/release/v22.0.0",
      },
      {
        label: "Node 24 release notes",
        url: "https://nodejs.org/en/blog/release/v24.0.0",
      },
      {
        label: "Node 26 release notes",
        url: "https://nodejs.org/en/blog/release/v26.0.0",
      },
    ],
    related: ["require-esm", "node-test-runner"],
  },
  {
    slug: "node-test-runner",
    title: "The native test runner",
    mapLabel: "node:test",
    area: "tooling",
    areaLabel: "Tooling",
    release: "24",
    milestone: "24 to 26",
    x: 50,
    y: 48,
    size: "large",
    kind: "landmark",
    summary:
      "Node 24 changes subtest lifecycles; Node 26 adds more randomisation and coverage controls.",
    impact:
      "The built-in runner covers more everyday testing without another framework, but test wrappers can be upgrade-sensitive.",
    timeline: [
      { version: "24", text: "Parent tests automatically wait for subtests." },
      { version: "26.1", text: "Test randomisation arrives." },
      { version: "26.7", text: "Coverage can include all matching files." },
    ],
    enables: [
      "Avoid accidentally detached subtests",
      "Randomise test execution",
      "Use more built-in coverage controls",
    ],
    limits: [
      "t.test() no longer follows the old promise return contract",
      "Wrappers and reporters may encode old assumptions",
      "Compile caching can affect precise coverage",
    ],
    checks: [
      "Search for returned or chained t.test() calls",
      "Retest custom wrappers and reporters",
      "Run order-sensitive suites with randomisation",
      "Disable compile cache for precise coverage",
    ],
    example: {
      language: "js",
      code: "test('parent', t => {\n  t.test('child', () => {\n    assert.equal(2 + 2, 4);\n  });\n  // The parent waits for the child.\n});",
    },
    sources: [
      {
        label: "Test runner documentation",
        url: "https://nodejs.org/api/test.html",
      },
      {
        label: "Node 24 release notes",
        url: "https://nodejs.org/en/blog/release/v24.0.0",
      },
    ],
    related: ["module-compile-cache", "native-addons"],
  },
  {
    slug: "permission-model",
    title: "Permission Model",
    mapLabel: "Permissions",
    area: "security",
    areaLabel: "Security",
    release: "22",
    milestone: "22.13 to 26.3",
    x: 36,
    y: 66,
    size: "large",
    kind: "fort",
    summary:
      "Runtime permissions stabilise in 22; Node 26 can permanently drop a grant after startup.",
    impact:
      "Applications can limit future filesystem, network, process and worker access if a dependency goes wrong.",
    timeline: [
      { version: "22.13", text: "The Permission Model becomes stable." },
      {
        version: "24",
        text: "The --permission workflow becomes ordinary runtime usage.",
      },
      {
        version: "26.3",
        text: "process.permission.drop() can relinquish a grant.",
      },
    ],
    enables: [
      "Limit filesystem and network access",
      "Block child processes, workers and native addons",
      "Drop startup-only grants after initialisation",
    ],
    limits: [
      "This is not a sandbox for hostile code",
      "Open files and sockets survive permission drops",
      "OS-level isolation is still required for untrusted code",
    ],
    checks: [
      "List the minimum grants the process needs",
      "Run integration tests under --permission",
      "Close open capabilities before dropping access",
      "Keep container or OS isolation for hostile input",
    ],
    example: {
      language: "js",
      code: "const config = fs.readFileSync('/etc/myapp/config.json', 'utf8');\n\n// Initialisation is finished.\nprocess.permission.drop('fs.read', '/etc/myapp');",
    },
    sources: [
      {
        label: "Permission Model",
        url: "https://nodejs.org/api/permissions.html",
      },
    ],
    related: ["node-26-removals", "native-addons"],
  },
  {
    slug: "temporal",
    title: "Temporal",
    mapLabel: "Temporal",
    area: "web",
    areaLabel: "JavaScript",
    release: "26",
    milestone: "26.0",
    x: 80,
    y: 18,
    size: "large",
    kind: "landmark",
    summary:
      "Node 26 enables Temporal globally for explicit, time-zone-aware date and time work.",
    impact:
      "Code can distinguish instants, calendar dates, zoned times and durations instead of forcing them through Date.",
    timeline: [
      {
        version: "22 and 24",
        text: "Temporal is not enabled globally by default.",
      },
      { version: "26", text: "Temporal is available globally by default." },
    ],
    enables: [
      "Represent zoned date-times without losing the zone",
      "Perform DST-aware arithmetic",
      "Use immutable date, time and duration types",
    ],
    limits: [
      "Temporal is not a mechanical drop-in replacement for Date",
      "You must choose the semantic type that matches the value",
      "Libraries may still need a polyfill for older supported runtimes",
    ],
    checks: [
      "Find hand-written millisecond arithmetic",
      "Classify values as instants, dates, zoned times or durations",
      "Test daylight-saving transitions",
      "Check the runtime floor for shared packages",
    ],
    example: {
      language: "js",
      code: "const meeting = Temporal.ZonedDateTime.from(\n  '2026-10-25T09:30[Europe/London]'\n);\nconst later = meeting.add({ hours: 3 });",
    },
    sources: [
      {
        label: "Temporal specification",
        url: "https://tc39.es/proposal-temporal/",
      },
      {
        label: "Node 26 release notes",
        url: "https://nodejs.org/en/blog/release/v26.0.0",
      },
    ],
    related: ["web-platform-apis", "single-executable-applications"],
  },
  {
    slug: "single-executable-applications",
    title: "Single executable applications",
    mapLabel: "Build an executable",
    area: "packaging",
    areaLabel: "Packaging",
    release: "26",
    milestone: "26",
    x: 91,
    y: 45,
    size: "large",
    kind: "harbour",
    summary:
      "Node 26 can build a single executable directly with node --build-sea.",
    impact:
      "The standard workflow no longer requires a separate tool to inject a preparation blob into a Node binary.",
    timeline: [
      {
        version: "22 and 24",
        text: "The workflow creates a blob and injects it externally.",
      },
      { version: "25.5", text: "node --build-sea is introduced." },
      {
        version: "26",
        text: "Direct SEA construction is available in the even-numbered line.",
      },
    ],
    enables: [
      "Build an executable from one config file",
      "Include assets",
      "Use snapshots or code cache for supported targets",
    ],
    limits: [
      "SEA remains in active development",
      "Snapshots and code caches are platform-specific",
      "The build Node binary must match target expectations",
    ],
    checks: [
      "Build and test for each target platform",
      "Do not assume artefacts are portable",
      "Check native dependencies inside the application",
      "Keep packaging tests in CI",
    ],
    example: {
      language: "json",
      code: '{\n  "main": "./dist/app.js",\n  "output": "./my-app",\n  "useCodeCache": true\n}\n\nnode --build-sea sea-config.json',
    },
    sources: [
      {
        label: "Single executable applications",
        url: "https://nodejs.org/api/single-executable-applications.html",
      },
    ],
    related: ["temporal", "node-26-removals"],
  },
  {
    slug: "native-addons",
    title: "Native addons and ABI",
    mapLabel: "Native ABI ridge",
    area: "compatibility",
    areaLabel: "Compatibility",
    release: "22",
    milestone: "127 to 147",
    x: 55,
    y: 82,
    size: "large",
    kind: "hazard",
    summary:
      "The internal native module ABI changes from 127 to 137 to 147 across the three majors.",
    impact:
      "Node-API addons are designed to travel across versions. Direct V8 and Node C++ bindings usually need new binaries and sometimes source changes.",
    timeline: [
      { version: "22", text: "NODE_MODULE_VERSION is 127." },
      { version: "24", text: "NODE_MODULE_VERSION is 137." },
      { version: "26", text: "NODE_MODULE_VERSION is 147." },
    ],
    enables: [
      "Use Node-API for ABI-stable native modules",
      "Keep direct bindings where lower-level access is required",
    ],
    limits: [
      "Not every native addon breaks on every major",
      "Direct V8 bindings have the highest upgrade risk",
      "Node source-build requirements do not automatically apply to every addon",
    ],
    checks: [
      "Find .node binaries and node-gyp dependencies",
      "Identify Node-API versus direct bindings",
      "Check prebuilt binaries for every OS and architecture",
      "Rebuild and function-test direct bindings",
    ],
    sources: [
      { label: "Node-API", url: "https://nodejs.org/api/n-api.html" },
      { label: "C++ addons", url: "https://nodejs.org/api/addons.html" },
    ],
    related: ["permission-model", "node-26-removals"],
  },
  {
    slug: "node-26-removals",
    title: "Node 26 removals",
    mapLabel: "Breaking coast",
    area: "compatibility",
    areaLabel: "Compatibility",
    release: "26",
    milestone: "24 to 26",
    x: 77,
    y: 82,
    size: "large",
    kind: "hazard",
    summary:
      "Several deprecations become removals, and Corepack stops shipping with Node.",
    impact:
      "Some upgrades fail in CI before the application starts; others break code that imports private or obsolete APIs.",
    timeline: [
      {
        version: "24",
        text: "url.parse(), shell argument patterns and older APIs warn or disappear.",
      },
      {
        version: "25",
        text: "Corepack stops shipping in the Node distribution.",
      },
      {
        version: "26",
        text: "Private stream modules, writeHeader() and transform-types are removed.",
      },
    ],
    enables: [
      "A smaller legacy surface",
      "Clearer supported TypeScript behavior",
      "More explicit package-manager provisioning",
    ],
    limits: [
      "corepack enable can fail before install starts",
      "Private _stream_* imports break",
      "Short AES-GCM tags need explicit authTagLength",
    ],
    checks: [
      "Provision pnpm, Yarn or Corepack explicitly",
      "Search for private stream imports and writeHeader()",
      "Review custom loaders and transform-types",
      "Check crypto tags and source-build toolchains",
    ],
    example: {
      language: "bash",
      code: "# Do not assume Node 26 bundles Corepack.\nnpm install --global corepack\ncorepack enable\npnpm install",
    },
    sources: [
      {
        label: "Node 26 release notes",
        url: "https://nodejs.org/en/blog/release/v26.0.0",
      },
      { label: "Corepack", url: "https://github.com/nodejs/corepack" },
    ],
    related: [
      "native-addons",
      "single-executable-applications",
      "permission-model",
    ],
  },
];

export const featureBySlug = new Map(
  nodeFeatures.map((feature) => [feature.slug, feature]),
);

export type MapLandmark = {
  id: string;
  label: string;
  release: "22" | "24" | "26";
  version: string;
  area: NodeFeature["area"];
  x: number;
  y: number;
  kind: "feature" | "milestone" | "risk";
  summary: string;
  detailSlug: string;
  journey?: "typescript" | "web" | "upgrade";
};

export const mapLandmarks: MapLandmark[] = [
  {
    id: "require-esm",
    label: "require(ESM)",
    release: "22",
    version: "22.0",
    area: "modules",
    x: 490,
    y: 150,
    kind: "feature",
    summary: "CommonJS can load synchronous ESM graphs.",
    detailSlug: "require-esm",
  },
  {
    id: "esm-flagless",
    label: "Flagless interop",
    release: "22",
    version: "22.12",
    area: "modules",
    x: 610,
    y: 105,
    kind: "milestone",
    summary: "require(esm) no longer needs its runtime flag.",
    detailSlug: "require-esm",
  },
  {
    id: "import-meta",
    label: "import.meta",
    release: "22",
    version: "22.18",
    area: "modules",
    x: 720,
    y: 155,
    kind: "milestone",
    summary:
      "dirname, filename and main make ESM entry points easier to manage.",
    detailSlug: "require-esm",
  },
  {
    id: "ts-introduced",
    label: "Type stripping",
    release: "22",
    version: "22.6",
    area: "typescript",
    x: 155,
    y: 245,
    kind: "feature",
    summary: "Node starts running TypeScript by removing erasable syntax.",
    detailSlug: "native-typescript",
    journey: "typescript",
  },
  {
    id: "ts-default",
    label: "Enabled by default",
    release: "22",
    version: "22.18",
    area: "typescript",
    x: 255,
    y: 335,
    kind: "milestone",
    summary: "Native TypeScript runs without the experimental warning.",
    detailSlug: "native-typescript",
    journey: "typescript",
  },
  {
    id: "ts-stable",
    label: "TypeScript stable",
    release: "24",
    version: "24.12",
    area: "typescript",
    x: 405,
    y: 360,
    kind: "feature",
    summary:
      "Type stripping reaches stable status, with the same deliberate limits.",
    detailSlug: "native-typescript",
    journey: "typescript",
  },
  {
    id: "ts-transform-removed",
    label: "Transforms removed",
    release: "26",
    version: "26.0",
    area: "typescript",
    x: 875,
    y: 235,
    kind: "risk",
    summary:
      "Node removes --experimental-transform-types and keeps erasable syntax only.",
    detailSlug: "native-typescript",
    journey: "typescript",
  },
  {
    id: "websocket",
    label: "WebSocket",
    release: "22",
    version: "22.0",
    area: "web",
    x: 105,
    y: 500,
    kind: "feature",
    summary: "A browser-compatible WebSocket client becomes global.",
    detailSlug: "web-platform-apis",
    journey: "web",
  },
  {
    id: "urlpattern",
    label: "URLPattern",
    release: "24",
    version: "24.0",
    area: "web",
    x: 350,
    y: 480,
    kind: "feature",
    summary: "Standard URL-aware pattern matching becomes global.",
    detailSlug: "web-platform-apis",
    journey: "web",
  },
  {
    id: "undici-7",
    label: "Undici 7",
    release: "24",
    version: "24.0",
    area: "web",
    x: 465,
    y: 525,
    kind: "milestone",
    summary: "Node moves its fetch and HTTP client stack to a new major.",
    detailSlug: "web-platform-apis",
    journey: "web",
  },
  {
    id: "temporal",
    label: "Temporal",
    release: "26",
    version: "26.0",
    area: "web",
    x: 1035,
    y: 300,
    kind: "feature",
    summary:
      "Time zones, instants, calendar dates and durations become built in.",
    detailSlug: "temporal",
    journey: "web",
  },
  {
    id: "undici-8",
    label: "Undici 8",
    release: "26",
    version: "26.0",
    area: "web",
    x: 1100,
    y: 430,
    kind: "milestone",
    summary: "The built-in fetch stack moves forward again.",
    detailSlug: "web-platform-apis",
    journey: "web",
  },
  {
    id: "built-in-workflow",
    label: "Watch · run · glob",
    release: "22",
    version: "22.0",
    area: "tooling",
    x: 460,
    y: 415,
    kind: "feature",
    summary: "More everyday development workflow moves into Node itself.",
    detailSlug: "module-compile-cache",
  },
  {
    id: "compile-cache",
    label: "Compile cache",
    release: "22",
    version: "22.1",
    area: "tooling",
    x: 545,
    y: 520,
    kind: "feature",
    summary: "Node persists V8 code cache for repeat launches.",
    detailSlug: "module-compile-cache",
  },
  {
    id: "portable-cache",
    label: "Portable cache",
    release: "24",
    version: "24.12",
    area: "tooling",
    x: 690,
    y: 535,
    kind: "milestone",
    summary: "Compile caches can survive a changed absolute project path.",
    detailSlug: "module-compile-cache",
  },
  {
    id: "test-subtests",
    label: "Subtests auto-wait",
    release: "24",
    version: "24.0",
    area: "tooling",
    x: 680,
    y: 420,
    kind: "risk",
    summary:
      "Parents wait for children, but wrappers relying on old promises can break.",
    detailSlug: "node-test-runner",
    journey: "upgrade",
  },
  {
    id: "async-context",
    label: "AsyncContextFrame",
    release: "24",
    version: "24.0",
    area: "tooling",
    x: 790,
    y: 505,
    kind: "milestone",
    summary: "AsyncLocalStorage gets a faster, more reliable implementation.",
    detailSlug: "node-test-runner",
  },
  {
    id: "test-diagnostics",
    label: "Tests + Perfetto",
    release: "26",
    version: "26.1 to 26.7",
    area: "tooling",
    x: 920,
    y: 430,
    kind: "feature",
    summary: "Randomisation, coverage controls and Perfetto improve diagnosis.",
    detailSlug: "node-test-runner",
  },
  {
    id: "permissions-stable",
    label: "Permissions stable",
    release: "22",
    version: "22.13",
    area: "security",
    x: 825,
    y: 350,
    kind: "feature",
    summary:
      "Runtime controls for files, network, children and workers stabilise.",
    detailSlug: "permission-model",
  },
  {
    id: "permission-drop",
    label: "Drop a permission",
    release: "26",
    version: "26.3",
    area: "security",
    x: 1000,
    y: 505,
    kind: "feature",
    summary: "A process can permanently give up a grant after startup.",
    detailSlug: "permission-model",
  },
  {
    id: "sea",
    label: "node --build-sea",
    release: "26",
    version: "26.0",
    area: "packaging",
    x: 1085,
    y: 575,
    kind: "feature",
    summary: "Node builds a single executable directly from configuration.",
    detailSlug: "single-executable-applications",
  },
  {
    id: "abi-127",
    label: "ABI 127",
    release: "22",
    version: "22.0",
    area: "compatibility",
    x: 260,
    y: 675,
    kind: "risk",
    summary: "Direct native bindings need a Node 22-compatible binary.",
    detailSlug: "native-addons",
    journey: "upgrade",
  },
  {
    id: "abi-137",
    label: "ABI 137",
    release: "24",
    version: "24.0",
    area: "compatibility",
    x: 580,
    y: 700,
    kind: "risk",
    summary: "The internal native addon ABI changes again.",
    detailSlug: "native-addons",
    journey: "upgrade",
  },
  {
    id: "corepack-removed",
    label: "Corepack removed",
    release: "26",
    version: "26.0",
    area: "compatibility",
    x: 820,
    y: 660,
    kind: "risk",
    summary: "CI must provision Corepack or its package manager explicitly.",
    detailSlug: "node-26-removals",
    journey: "upgrade",
  },
  {
    id: "legacy-removed",
    label: "Legacy APIs removed",
    release: "26",
    version: "26.0",
    area: "compatibility",
    x: 965,
    y: 700,
    kind: "risk",
    summary:
      "Private streams, writeHeader and other compatibility APIs disappear.",
    detailSlug: "node-26-removals",
    journey: "upgrade",
  },
  {
    id: "abi-147",
    label: "ABI 147",
    release: "26",
    version: "26.0",
    area: "compatibility",
    x: 1090,
    y: 660,
    kind: "risk",
    summary: "Direct V8 and Node C++ addons need a Node 26 build.",
    detailSlug: "native-addons",
    journey: "upgrade",
  },
];
