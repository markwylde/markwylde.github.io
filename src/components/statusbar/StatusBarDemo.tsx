import { type ReactNode, useEffect, useRef, useState } from "react";

// A small, clickable mock of a Terminay window, used to show each status bar
// concept from the post. Everything is fake: no terminals run here.

export type Variant = "before" | "c1" | "c2" | "c3" | "c4" | "c5" | "final";
type Exposure = "offline" | "idle" | "connected";

interface Pane {
  cwd: string;
  branch: string | null;
  dirty?: number;
  ahead?: number;
  proc: string;
  out: string[];
}
interface Tab {
  name: string;
  active?: boolean;
  panes: Pane[];
}
interface Project {
  name: string;
  color: string;
  hi: string;
  term: string;
  tabs: Tab[];
}

const PROJECTS: Project[] = [
  {
    name: "terminay",
    color: "#4d7a38",
    hi: "#6a9a52",
    term: "#13210f",
    tabs: [
      {
        name: "Terminal 1",
        active: true,
        panes: [
          {
            cwd: "~/Projects/terminay/terminay",
            branch: "main",
            proc: "claude",
            out: ["✻ Claude Code", "  Reading src/App.tsx…"],
          },
        ],
      },
      {
        name: "Terminal 2",
        panes: [
          {
            cwd: "~/Projects/terminay/terminay-auto-expose",
            branch: "feat/auto-expose",
            dirty: 3,
            ahead: 2,
            proc: "zsh",
            out: ["$ git status -s", " M src/host/expose.ts", " M src/App.tsx"],
          },
          {
            cwd: "~/Projects/terminay/terminay/apps/web",
            branch: "main",
            proc: "npm run dev",
            out: ["$ npm run dev", "  VITE ready in 412 ms"],
          },
        ],
      },
      {
        name: "Downloads",
        panes: [
          {
            cwd: "~/Downloads",
            branch: null,
            proc: "zsh",
            out: ["$ ls", "terminay-arm64.dmg"],
          },
        ],
      },
    ],
  },
  {
    name: "paged",
    color: "#35608f",
    hi: "#4f7fb3",
    term: "#0f1824",
    tabs: [
      {
        name: "api",
        panes: [
          {
            cwd: "~/Projects/paged/services/api/src/handlers/uploads",
            branch: "fix/signed-upload-url-expiry",
            dirty: 1,
            proc: "zsh",
            out: ["$ npm test -- uploads", " PASS  getUploadUrl.test.ts"],
          },
        ],
      },
      {
        name: "logs",
        panes: [
          {
            cwd: "/var/log",
            branch: null,
            proc: "tail -f",
            out: ["$ tail -f system.log"],
          },
        ],
      },
    ],
  },
];

const CSS = `
.tsb{display:flex;flex-direction:column;gap:10px;margin:1.5rem 0}
.tsb .ctl{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;font-size:0.78rem;color:var(--muted)}
.tsb .seg{margin:0;min-width:0;display:inline-flex;border:1px solid var(--line);border-radius:999px;background:var(--btn-bg);padding:2px}
.tsb .seg button{border:0;background:none;font:inherit;font-weight:600;color:var(--muted);padding:5px 11px;border-radius:999px;cursor:pointer}
.tsb .seg button.on{background:#6f7bff;color:#fff}
.tsb .hint{font-size:0.76rem;color:var(--muted)}
.tsb .win{--proj:#4d7a38;--hi:#6a9a52;--term:#13210f;--ink:#eef6ea;border-radius:10px;overflow:hidden;background:#0b0d0a;box-shadow:0 12px 40px rgba(0,0,0,.28),0 0 0 1px rgba(0,0,0,.6);color:#d8ddd3;font-family:Inter,-apple-system,system-ui,sans-serif;font-size:12px;display:flex;flex-direction:column;height:330px;position:relative;text-align:left}
.tsb .title{display:flex;align-items:flex-end;gap:4px;height:34px;padding:0 8px 0 10px;flex:none}
.tsb .lights{display:flex;gap:6px;align-self:center;margin-right:8px}
.tsb .lights i{width:10px;height:10px;border-radius:50%;display:block}
.tsb .ptab{height:28px;border:0;background:none;color:#8f958a;font:inherit;font-weight:600;padding:0 12px;border-radius:7px 7px 0 0;cursor:pointer}
.tsb .ptab.on{background:var(--proj);color:var(--ink)}
.tsb .sp{flex:1}
.tsb .pick{align-self:center;display:flex;align-items:center;gap:6px;height:22px;padding:0 9px;border-radius:6px;background:#17191b;font-weight:600;color:#d8dcd4;font-size:11.5px}
.tsb .pick .chev{opacity:.5;font-size:9px}
.tsb .pill{background:#72d5ff;color:#101318;border-radius:999px;font-size:10px;font-weight:800;padding:1px 6px}
.tsb .body{flex:1;display:flex;min-height:0}
.tsb .side{width:150px;background:#0e100d;border-right:1px solid #1c1f1a;flex:none;padding:8px 0;font-size:11.5px;color:#c9cdc5}
.tsb .side div{padding:3px 12px}
.tsb .side .h{font-size:10px;font-weight:700;letter-spacing:.05em;color:#8d938a}
.tsb .main{flex:1;display:flex;flex-direction:column;min-width:0}
.tsb .ttabs{height:30px;background:var(--proj);display:flex;align-items:center;gap:4px;padding:0 5px;flex:none;overflow:hidden}
.tsb .ttab{height:22px;border:0;border-radius:5px;background:rgba(0,0,0,.14);color:var(--ink);opacity:.78;font:inherit;padding:0 9px;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap}
.tsb .ttab.on{background:var(--hi);opacity:1;font-weight:600}
.tsb .ttab .act{width:6px;height:6px;border-radius:50%;background:#e2b93b}
.tsb .panes{flex:1;display:flex;background:var(--term);min-height:0}
.tsb .pane{display:flex;flex-direction:column;justify-content:flex-start;flex:1;min-width:0;padding:10px 12px;font-family:ui-monospace,Menlo,monospace;font-size:11px;line-height:1.6;color:#cfd6c9;cursor:text;position:relative;overflow:hidden;border:0;background:none;text-align:left}
.tsb .pane+.pane{border-left:1px solid rgba(255,255,255,.08)}
.tsb .panes.split .pane:not(.on){opacity:.5}
.tsb .panes.split .pane.on{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--hi) 60%,transparent)}
.tsb .pane div{overflow-wrap:anywhere}
.tsb .pane .u{color:#7fcf6a}.tsb .pane .p{color:#8fb8e8}.tsb .pane .b{color:#d7a8f0}.tsb .pane .d{color:#6f7a69}
.tsb .cur{display:inline-block;width:6px;height:12px;background:#cfd6c9;vertical-align:-2px}
.tsb .dot{width:8px;height:8px;border-radius:50%;flex:none;background:#8a8f86;position:relative;display:inline-block}
.tsb .dot.red{background:#ef5b5b}
.tsb .dot.blue{background:#4a9dff;box-shadow:0 0 0 3px rgba(74,157,255,.2)}
.tsb .dot.pulse::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:1.5px solid #4a9dff;animation:tsb-ring 2.2s ease-out infinite}
@keyframes tsb-ring{from{transform:scale(.5);opacity:.9}to{transform:scale(1.6);opacity:0}}
.tsb .sb{display:flex;align-items:center;flex:none;min-width:0;white-space:nowrap}
.tsb .sb .l{flex:1;min-width:0;display:flex;align-items:center;overflow:hidden}
.tsb .sb .r{flex:none;display:flex;align-items:center}
.tsb .mono{font-family:ui-monospace,Menlo,monospace;font-size:10.5px}
.tsb .gs{font-family:ui-monospace,Menlo,monospace;font-size:10px;display:inline-flex;gap:5px;margin-left:6px}
.tsb .gs .dirty{color:#e2b93b}.tsb .gs .ahead{color:#9ec3ff}
.tsb .sb span:has(> svg),.tsb .pop .row{display:inline-flex;align-items:center;gap:5px}
.tsb .pop .row{display:flex}
.tsb .trunc{overflow:hidden;text-overflow:ellipsis;min-width:0}
.tsb .flash{animation:tsb-flash .6s ease-out}
@keyframes tsb-flash{from{background:color-mix(in srgb,var(--proj) 55%,transparent);color:#fff}to{background:transparent}}
.tsb .slide{animation:tsb-slide .3s cubic-bezier(.2,.8,.2,1) both}
@keyframes tsb-slide{from{transform:translateY(70%);opacity:0}}
.tsb .fade{animation:tsb-fade .35s ease}
@keyframes tsb-fade{from{opacity:0;filter:blur(3px)}}
/* c1 */
.tsb .c1{height:22px;background:#0b0d0a;border-top:1px solid #1d201b;color:#aab0a4;padding:0 4px;gap:2px}
.tsb .c1 .it{display:flex;align-items:center;gap:6px;padding:0 7px;height:22px;min-width:0}
.tsb .c1 .sep{width:1px;height:11px;background:#2a2e27}
/* c2 + final */
.tsb .tint{height:24px;background:color-mix(in srgb,var(--proj) 70%,#000);color:var(--ink);overflow:hidden}
.tsb .tint .first{height:24px;display:flex;align-items:center;gap:7px;padding:0 12px 0 8px;background:var(--hi);font-weight:600;position:relative;flex:none;margin-right:8px}
.tsb .tint .first::after{content:"";position:absolute;right:-9px;top:0;border-left:9px solid var(--hi);border-top:12px solid transparent;border-bottom:12px solid transparent}
.tsb .tint .seg2{display:flex;align-items:center;gap:6px;padding:0 6px;min-width:0}
.tsb .crumbs{display:flex;align-items:center;min-width:0;overflow:hidden}
.tsb .crumbs .c{padding:1px 3px;opacity:.72}
.tsb .crumbs .c.last{opacity:1;color:#fff;font-weight:600}
.tsb .crumbs .s{opacity:.4}
.tsb .chip{display:inline-flex;align-items:center;gap:5px;background:rgba(0,0,0,.25);border-radius:999px;padding:2px 9px;min-width:0;max-width:220px}
.tsb .srv{display:inline-flex;align-items:center;gap:7px;background:rgba(0,0,0,.3);border-radius:999px;padding:2px 9px 2px 7px;margin-right:5px;font-weight:500}
.tsb .glyph{position:relative;width:18px;height:12px;border:1px solid rgba(255,255,255,.4);border-radius:3px;box-sizing:border-box;flex:none}
.tsb .glyph i{position:absolute;top:0;bottom:0;box-sizing:border-box;border:1px solid transparent;background-clip:padding-box;background-color:rgba(0,0,0,.28)}
.tsb .glyph i.on{background-color:#fff}
.tsb .rem{display:flex;align-items:center;gap:7px;padding:0 10px;height:100%;cursor:pointer}
.tsb .rem .lbl{opacity:.8}
.tsb .dev{color:#9fcbff;display:inline-flex;gap:2px}
/* c3 */
.tsb .c3{height:20px;background:var(--term);color:#5f6a5a;padding:0 10px;gap:12px;border-top:1px solid rgba(255,255,255,.04);transition:color .2s}
.tsb .c3:hover{color:#b7c0b1}
.tsb .c3 .l{gap:12px}
.tsb .c3 .r{gap:7px}
.tsb .c3 .count{color:#4a9dff}
.tsb .c3 .nm{max-width:0;overflow:hidden;transition:max-width .25s ease}
.tsb .c3:hover .nm{max-width:120px}
/* c4 */
.tsb .c4{height:24px;background:#0d0f0c;border-top:2px solid var(--proj);color:#c3c9bd;padding:0 10px 0 7px;gap:9px}
.tsb .c4 .l{gap:9px}
.tsb .c4 .glyph{border-color:#3a4036}
.tsb .c4 .glyph i{background-color:#2f352b}
.tsb .c4 .glyph i.on{background-color:var(--hi)}
.tsb .c4 .keep{color:#7d8577}.tsb .c4 .new{color:#fff}
.tsb .c4 .br{color:#d7a8f0}
.tsb .c4 .r{gap:8px}
/* c5 */
.tsb .c5{height:24px;background:#0b0d0a;border-top:1px solid #1d201b;color:#aab0a4;padding:0 4px 0 10px;gap:10px}
.tsb .c5 .l{gap:12px}
.tsb .hub{display:flex;align-items:center;gap:7px;height:20px;padding:0 9px;border-radius:6px;border:1px solid transparent;background:none;color:#dfe4da;font:inherit;font-weight:500;cursor:pointer}
.tsb .hub:hover,.tsb .hub.open{background:#1a1d18;border-color:#2a2e27}
.tsb .pop{position:absolute;right:8px;bottom:32px;width:250px;background:#111410;border:1px solid #2a2e27;border-radius:10px;box-shadow:0 16px 48px rgba(0,0,0,.6);color:#dfe4da;font-size:11.5px;z-index:3;overflow:hidden}
.tsb .pop .sec{padding:10px 12px;border-bottom:1px solid #1f231d}
.tsb .pop .sec:last-child{border-bottom:0}
.tsb .pop .hd{font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:#7d8577;margin-bottom:6px;font-weight:700}
.tsb .pop .row{display:flex;align-items:center;gap:8px;padding:3px 0}
.tsb .pop .grow{flex:1}
.tsb .pop .meta{color:#7d8577;font-size:10.5px}
.tsb .tog{width:28px;height:16px;border-radius:999px;background:#3a3f37;position:relative;border:0;cursor:pointer;flex:none}
.tsb .tog::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;transition:transform .15s}
.tsb .tog.on{background:#4a9dff}.tsb .tog.on::after{transform:translateX(12px)}
@media (max-width:640px){.tsb .side{display:none}.tsb .win{height:300px}.tsb .c4 .proc,.tsb .c4 .lbl{display:none}}
@media (prefers-reduced-motion:reduce){.tsb .flash,.tsb .slide,.tsb .fade,.tsb .dot.pulse::after{animation:none}}
`;

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      style={{ flex: "none" }}
    >
      {children}
    </svg>
  );
}
const PhoneIcon = () => (
  <Svg>
    <rect x="4.5" y="1.8" width="7" height="12.4" rx="1.6" />
    <path d="M7.2 12h1.6" />
  </Svg>
);
const FolderIcon = () => (
  <Svg>
    <path d="M1.8 4.2c0-.6.5-1 1-1h3.4l1.5 1.6h5.5c.6 0 1 .4 1 1v6.5c0 .5-.4 1-1 1H2.8c-.5 0-1-.5-1-1z" />
  </Svg>
);
const BranchIcon = () => (
  <Svg>
    <circle cx="4.5" cy="3.5" r="1.6" />
    <circle cx="4.5" cy="12.5" r="1.6" />
    <circle cx="11.5" cy="5" r="1.6" />
    <path d="M4.5 5.1v5.8M11.5 6.6c0 3-7 2-7 4.3" />
  </Svg>
);

function dotTone(exposure: Exposure): string {
  if (exposure === "offline") return "red";
  if (exposure === "connected") return "blue";
  return "";
}
function remoteLabel(exposure: Exposure): string {
  if (exposure === "offline") return "Not exposed";
  if (exposure === "idle") return "Exposed";
  return "2 devices";
}
function shortPath(p: string, keep: number): string {
  const parts = p.split("/");
  if (parts.length <= keep + 1) return p;
  return `${parts[0]}/…/${parts.slice(-keep).join("/")}`;
}
function GitStat({ pane }: { pane: Pane }) {
  if (!pane.dirty && !pane.ahead) return null;
  return (
    <span className="gs">
      {pane.dirty ? <span className="dirty">●{pane.dirty}</span> : null}
      {pane.ahead ? <span className="ahead">↑{pane.ahead}</span> : null}
    </span>
  );
}
function Glyph({ count, focused }: { count: number; focused: number }) {
  return (
    <span className="glyph">
      {Array.from({ length: count }, (_, i) => (
        <i
          // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional
          key={i}
          className={i === focused ? "on" : undefined}
          style={{ left: `${(i / count) * 100}%`, width: `${100 / count}%` }}
        />
      ))}
    </span>
  );
}

interface BarProps {
  pane: Pane;
  tab: Tab;
  paneIndex: number;
  exposure: Exposure;
  ctx: string;
  prevCwd: string | null;
  popOpen: boolean;
  onHub: () => void;
  onExpose: () => void;
}

function Crumbs({
  cwd,
  prevCwd,
  collapse,
}: {
  cwd: string;
  prevCwd: string | null;
  collapse: boolean;
}) {
  const parts = cwd.split("/");
  let firstNew = parts.length;
  if (prevCwd !== null && prevCwd !== cwd) {
    const a = prevCwd.split("/");
    let i = 0;
    while (i < a.length && i < parts.length && a[i] === parts[i]) i++;
    firstNew = i;
  }
  const idx = parts.map((_, i) => i);
  const shown = collapse && idx.length > 5 ? [0, -1, ...idx.slice(-3)] : idx;
  let delay = 0;
  const nodes: ReactNode[] = [];
  shown.forEach((i, pos) => {
    if (pos > 0)
      nodes.push(
        <span key={`s${cwd}:${i}`} className="s">
          /
        </span>,
      );
    if (i === -1) {
      nodes.push(
        <span key="ell" className="s">
          …
        </span>,
      );
      return;
    }
    const isNew = i >= firstNew;
    nodes.push(
      <span
        key={`${cwd}:${i}`}
        className={`c${i === parts.length - 1 ? " last" : ""}${isNew ? " slide" : ""}`}
        style={isNew ? { animationDelay: `${delay++ * 45}ms` } : undefined}
      >
        {parts[i]}
      </span>,
    );
  });
  return <span className="crumbs mono">{nodes}</span>;
}

function Bar(props: BarProps & { variant: Variant }) {
  const { pane, tab, paneIndex, exposure, ctx, prevCwd, variant } = props;
  const tone = dotTone(exposure);
  const connected = exposure === "connected";
  switch (variant) {
    case "c1":
      return (
        <div className="sb c1">
          <div className="l">
            <span key={`p${pane.cwd}`} className="it flash mono">
              <FolderIcon />{" "}
              <span className="trunc">{shortPath(pane.cwd, 3)}</span>
            </span>
            {pane.branch ? (
              <>
                <span className="sep" />
                <span key={`b${pane.branch}`} className="it flash mono">
                  <BranchIcon /> <span className="trunc">{pane.branch}</span>
                  <GitStat pane={pane} />
                </span>
              </>
            ) : null}
          </div>
          <div className="r">
            <span className="it">
              <span className={`dot ${tone}`} /> {remoteLabel(exposure)}
            </span>
            <span className="sep" />
            <span className="it">Local</span>
          </div>
        </div>
      );
    case "c2":
      return (
        <div className="sb tint">
          <div className="l">
            <span className="first">
              {tab.name}
              {tab.panes.length > 1 ? (
                <span style={{ opacity: 0.7, fontWeight: 400 }}>
                  · pane {paneIndex + 1}
                </span>
              ) : null}
            </span>
            <span key={`p${ctx}`} className="seg2 slide">
              <FolderIcon /> <Crumbs cwd={pane.cwd} prevCwd={null} collapse />
            </span>
            {pane.branch ? (
              <span key={`b${ctx}`} className="seg2 slide">
                <span className="chip mono">
                  <BranchIcon /> <span className="trunc">{pane.branch}</span>
                  <GitStat pane={pane} />
                </span>
              </span>
            ) : null}
          </div>
          <div className="r">
            <span className="srv">
              <span className={`dot ${tone}${connected ? " pulse" : ""}`} />
              Local{connected ? " · 2" : ""}
            </span>
          </div>
        </div>
      );
    case "c3":
      return (
        <div className="sb c3 mono">
          <div className="l">
            <span key={`p${ctx}`} className="fade">
              {shortPath(pane.cwd, 2)}
            </span>
            {pane.branch ? (
              <span key={`b${ctx}`} className="fade trunc">
                <BranchIcon /> {pane.branch}
                <GitStat pane={pane} />
              </span>
            ) : null}
          </div>
          <div className="r" title={remoteLabel(exposure)}>
            <span className="nm">Local</span>
            {connected ? <span className="count">2</span> : null}
            <span className={`dot ${tone}`} />
          </div>
        </div>
      );
    case "c4": {
      const parts = pane.cwd.split("/");
      let keep = `${parts.slice(0, -1).join("/")}/`;
      let neu = parts.at(-1) ?? "";
      if (prevCwd !== null && prevCwd !== pane.cwd) {
        const a = prevCwd.split("/");
        let i = 0;
        while (i < a.length && i < parts.length && a[i] === parts[i]) i++;
        keep = parts.slice(0, i).join("/") + (i ? "/" : "");
        neu = parts.slice(i).join("/");
      }
      return (
        <div className="sb c4">
          <div className="l">
            <Glyph count={tab.panes.length} focused={paneIndex} />
            <span style={{ fontWeight: 600, color: "#fff" }}>{tab.name}</span>
            <span className="mono trunc">
              <span className="keep">{keep}</span>
              <span key={pane.cwd} className="new fade">
                {neu}
              </span>
            </span>
            {pane.branch ? (
              <span className="br mono trunc">
                <BranchIcon /> {pane.branch}
                <GitStat pane={pane} />
              </span>
            ) : null}
            <span className="proc mono" style={{ color: "#6d7468" }}>
              {pane.proc}
            </span>
          </div>
          <div className="r">
            {connected ? (
              <span className="dev">
                <PhoneIcon />
                <PhoneIcon />
              </span>
            ) : null}
            <span className="lbl" style={{ color: "#8b9285" }}>
              {remoteLabel(exposure)}
            </span>
            <span className={`dot ${tone}`} />
            <span style={{ fontWeight: 600, color: "#e6eae2" }}>Local</span>
          </div>
        </div>
      );
    }
    case "c5":
      return (
        <div className="sb c5">
          <div className="l mono">
            <span key={`p${ctx}`} className="slide trunc">
              <FolderIcon /> {shortPath(pane.cwd, 3)}
            </span>
            {pane.branch ? (
              <span
                key={`b${ctx}`}
                className="slide trunc"
                style={{ color: "#d7a8f0" }}
              >
                <BranchIcon /> {pane.branch}
                <GitStat pane={pane} />
              </span>
            ) : null}
          </div>
          <div className="r">
            <button
              type="button"
              className={`hub${props.popOpen ? " open" : ""}`}
              onClick={props.onHub}
            >
              <span className={`dot ${tone}${connected ? " pulse" : ""}`} />
              Local
              {connected ? <span style={{ color: "#4a9dff" }}>2</span> : null}
              <span style={{ opacity: 0.5, fontSize: 9 }}>▼</span>
            </button>
          </div>
        </div>
      );
    default:
      return (
        <div className="sb tint">
          <div className="l">
            <span className="first">
              <Glyph count={tab.panes.length} focused={paneIndex} />
              {tab.name}
            </span>
            <span className="seg2">
              <FolderIcon />{" "}
              <Crumbs cwd={pane.cwd} prevCwd={prevCwd} collapse />
            </span>
            {pane.branch ? (
              <span key={`b${pane.branch}`} className="seg2 slide">
                <span className="chip mono">
                  <BranchIcon /> <span className="trunc">{pane.branch}</span>
                  <GitStat pane={pane} />
                </span>
              </span>
            ) : null}
          </div>
          <div className="r rem">
            {connected ? (
              <span className="dev">
                <PhoneIcon />
                <PhoneIcon />
              </span>
            ) : null}
            <span className="lbl">{remoteLabel(exposure)}</span>
            <span className={`dot ${tone}${connected ? " pulse" : ""}`} />
          </div>
        </div>
      );
  }
}

export default function StatusBarDemo({
  variant,
  initialExposure = "connected",
}: {
  variant: Variant;
  initialExposure?: Exposure;
}) {
  const [project, setProject] = useState(0);
  const [tabs, setTabs] = useState([1, 0]);
  const [panes, setPanes] = useState([
    [0, 1, 0],
    [0, 0],
  ]);
  const [exposure, setExposure] = useState<Exposure>(initialExposure);
  const [popOpen, setPopOpen] = useState(false);

  const proj = PROJECTS[project];
  const tabIndex = tabs[project];
  const tab = proj.tabs[tabIndex];
  const paneIndex = panes[project][tabIndex];
  const pane = tab.panes[paneIndex];
  const ctx = `${project}:${tabIndex}:${paneIndex}`;

  // The previously shown path, so only the differing tail animates.
  const shownRef = useRef<{ cwd: string; prev: string | null }>({
    cwd: pane.cwd,
    prev: null,
  });
  if (shownRef.current.cwd !== pane.cwd) {
    shownRef.current = { cwd: pane.cwd, prev: shownRef.current.cwd };
  }
  const prevCwd = shownRef.current.prev;

  useEffect(() => {
    if (!popOpen) return;
    const close = () => setPopOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [popOpen]);

  const focusPane = (i: number) =>
    setPanes((cur) =>
      cur.map((row, p) =>
        p === project ? row.map((v, t) => (t === tabIndex ? i : v)) : row,
      ),
    );

  const showBar = variant !== "before";
  const connected = exposure === "connected";

  let picker: ReactNode = null;
  if (variant === "before") {
    picker = (
      <span className="pick">
        {exposure === "offline" ? "▶" : "■"} Local
        {connected ? <span className="pill">2</span> : null}
        <span className="chev">▼</span>
      </span>
    );
  } else if (variant !== "c5") {
    picker = (
      <span className="pick">
        Local
        {variant !== "final" && connected ? (
          <span className="dot blue" />
        ) : null}
        <span className="chev">▼</span>
      </span>
    );
  }

  const user = "mark@mbp";
  return (
    <div className="demo tsb">
      <style>{CSS}</style>
      <div
        className="win"
        style={
          {
            "--proj": proj.color,
            "--hi": proj.hi,
            "--term": proj.term,
          } as React.CSSProperties
        }
      >
        <div className="title">
          <span className="lights">
            <i style={{ background: "#ff5f57" }} />
            <i style={{ background: "#febc2e" }} />
            <i style={{ background: "#28c840" }} />
          </span>
          {PROJECTS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              className={`ptab${i === project ? " on" : ""}`}
              onClick={() => setProject(i)}
              style={i === project ? undefined : undefined}
            >
              {p.name}
            </button>
          ))}
          <span className="sp" />
          {picker}
        </div>
        <div className="body">
          <div className="side">
            <div className="h">FILES</div>
            <div>src</div>
            <div>openspec</div>
            <div>electron</div>
            <div>package.json</div>
          </div>
          <div className="main">
            <div className="ttabs">
              {proj.tabs.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  className={`ttab${i === tabIndex ? " on" : ""}`}
                  onClick={() =>
                    setTabs((cur) => cur.map((v, p) => (p === project ? i : v)))
                  }
                >
                  {t.active ? <span className="act" /> : null}
                  {t.name}
                  {t.panes.length > 1 ? (
                    <span style={{ opacity: 0.7, fontSize: 10 }}>
                      ⫴{t.panes.length}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className={`panes${tab.panes.length > 1 ? " split" : ""}`}>
              {tab.panes.map((p, i) => (
                <button
                  key={p.cwd}
                  type="button"
                  className={`pane${i === paneIndex ? " on" : ""}`}
                  onClick={() => focusPane(i)}
                >
                  {p.out.map((line) => (
                    <div
                      key={line}
                      className={line.startsWith("$") ? "d" : undefined}
                    >
                      {line}
                    </div>
                  ))}
                  <div style={{ marginTop: 4 }}>
                    <span className="u">{user}</span>{" "}
                    <span className="p">{p.cwd}</span>
                    {p.branch ? <span className="b"> ({p.branch})</span> : null}{" "}
                    $ {i === paneIndex ? <span className="cur" /> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        {showBar ? (
          <Bar
            variant={variant}
            pane={pane}
            tab={tab}
            paneIndex={paneIndex}
            exposure={exposure}
            ctx={ctx}
            prevCwd={prevCwd}
            popOpen={popOpen}
            onHub={() => setPopOpen((o) => !o)}
            onExpose={() =>
              setExposure((e) => (e === "offline" ? "idle" : "offline"))
            }
          />
        ) : null}
        {variant === "c5" && popOpen ? (
          // biome-ignore lint/a11y/noStaticElementInteractions: stops the outside-click close
          // biome-ignore lint/a11y/useKeyWithClickEvents: container only stops propagation
          <div className="pop" onClick={(e) => e.stopPropagation()}>
            <div className="sec">
              <div className="row">
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>Expose this Mac</div>
                  <div className="meta">
                    {exposure === "offline"
                      ? "Only this window"
                      : "Reachable from your devices"}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Expose this Mac"
                  className={`tog${exposure === "offline" ? "" : " on"}`}
                  onClick={() =>
                    setExposure((e) => (e === "offline" ? "idle" : "offline"))
                  }
                />
              </div>
            </div>
            <div className="sec">
              <div className="hd">Connected devices</div>
              {connected ? (
                <>
                  <div className="row">
                    <PhoneIcon /> <span className="grow">iPhone · Safari</span>
                    <span className="meta">active</span>
                  </div>
                  <div className="row">
                    <PhoneIcon /> <span className="grow">iPad · Terminay</span>
                    <span className="meta">idle</span>
                  </div>
                </>
              ) : (
                <div className="meta">No devices connected</div>
              )}
            </div>
            <div className="sec">
              <div className="hd">Server</div>
              <div className="row">
                <span className="grow">Local</span>✓
              </div>
              <div className="row">
                <span className="grow">mark-studio</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="ctl">
        <fieldset className="seg" aria-label="Remote access">
          {(["offline", "idle", "connected"] as Exposure[]).map((e) => (
            <button
              key={e}
              type="button"
              className={exposure === e ? "on" : undefined}
              onClick={() => setExposure(e)}
            >
              {e === "offline"
                ? "Not exposed"
                : e === "idle"
                  ? "Exposed"
                  : "Phone connected"}
            </button>
          ))}
        </fieldset>
        <span className="hint">
          {variant === "before"
            ? "Watch the top right."
            : "Click the project tabs, the terminal tabs, and the two panes in Terminal 2."}
        </span>
      </div>
    </div>
  );
}
