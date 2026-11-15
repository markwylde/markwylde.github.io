import { BASE_CSS } from "../bulletin/bits";

// The Terminay workflow, rebuilt from the session transcripts. Each step is a
// window of wall time for the agent doing it, split into:
// - AI: the model generating (from the request before each assistant message
//   to the end of that message),
// - compute: tool calls running plus background jobs (builds, Docker, unit,
//   integration and E2E runs, screenshots, CI),
// - blocked: the agent stopped, waiting on the orchestrator for a test slot,
//   a review, or Docker to come back.
type Step = {
  n: number;
  name: string;
  what: string;
  when: string;
  ai: number;
  compute: number;
  blocked: number;
  icon: "plan" | "tool" | "code" | "check" | "flag";
};

const STEPS: Step[] = [
  {
    n: 1,
    name: "Plan",
    what: "Read the ADRs and templates, ask six questions, write ADR 0021 and the ui-rebuild change. Blocked time is me answering.",
    when: "10:31–10:39",
    ai: 2.4,
    compute: 1.2,
    blocked: 4.4,
    icon: "plan",
  },
  {
    n: 2,
    name: "Phase 0: tooling",
    what: "ui-shots, the data-* hook guard, a tablet viewport, self-hosted Inter.",
    when: "10:39–10:46",
    ai: 4.3,
    compute: 2.7,
    blocked: 0,
    icon: "tool",
  },
  {
    n: 3,
    name: "Forum shell",
    what: "Tokens, header, breadcrumbs, footer, states and the board index. Its E2E run was stuck on the overloaded box from 11:40 until Docker hung at 13:55, and only restarted after Docker came back.",
    when: "10:46–14:37",
    ai: 27.4,
    compute: 65.2,
    blocked: 138.4,
    icon: "code",
  },
  {
    n: 4,
    name: "Staff shell",
    what: "The staff UI kit, icon rail, grouped panel, ⌘K search and dashboard. Ran in parallel with the forum shell, and kept losing E2E runs to Chrome crashes.",
    when: "10:46–15:32",
    ai: 58.1,
    compute: 184.3,
    blocked: 43.6,
    icon: "code",
  },
  {
    n: 5,
    name: "Forum pages",
    what: "Forum, topic, search, profiles, members, account, conversations, moderation, sign-in pages and the Lounge theme.",
    when: "14:37–17:09",
    ai: 32.6,
    compute: 78.4,
    blocked: 41,
    icon: "code",
  },
  {
    n: 6,
    name: "Staff pages",
    what: "All 38 staff sections rebuilt on the kit, area by area.",
    when: "15:32–16:46",
    ai: 7.5,
    compute: 53.8,
    blocked: 12.7,
    icon: "code",
  },
  {
    n: 7,
    name: "Polish + CI fixes",
    what: "Three rounds of CI fixes, then a page-by-page review of both apps and new E2E tests.",
    when: "17:09–18:37",
    ai: 25.2,
    compute: 62.1,
    blocked: 0.7,
    icon: "check",
  },
  {
    n: 8,
    name: "Final fixes",
    what: "Avatars, the tip plugin, post actions, the Members crumb and the display-name E2E race.",
    when: "18:37–19:27",
    ai: 11.5,
    compute: 32.7,
    blocked: 5.8,
    icon: "check",
  },
  {
    n: 9,
    name: "Wait for green CI",
    what: "The orchestrator waiting on GitHub Actions for d52cfbea.",
    when: "19:27–19:41",
    ai: 0.2,
    compute: 13.8,
    blocked: 0,
    icon: "check",
  },
];

const AI = "#e0915a";
const COMPUTE = "#3fb950";
const BLOCKED = "#56606a";
const total = (s: Step) => s.ai + s.compute + s.blocked;
const MAX = Math.max(...STEPS.map(total));
const sum = (k: "ai" | "compute" | "blocked") =>
  STEPS.reduce((a, s) => a + s[k], 0);
const fmt = (m: number) => {
  const r = Math.round(m);
  return r < 60
    ? `${r}m`
    : `${Math.floor(r / 60)}h ${String(r % 60).padStart(2, "0")}m`;
};

const CSS = `
.b2-wf{background:#0d1514;border:1px solid #1f2c2a;border-radius:12px;color:#d7e0dd;overflow:hidden}
.b2-wf .hd{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 20px;align-items:flex-end;padding:16px 20px 14px;border-bottom:1px solid #1f2c2a}
.b2-wf .k{font-size:.66rem;letter-spacing:.12em;font-weight:700;color:#7d8c88}
.b2-wf .t{font-family:var(--font-mono,ui-monospace,monospace);font-weight:700;font-size:.95rem;color:#f1f5f4;margin-top:2px}
.b2-wf .s{font-size:.78rem;color:#8a9894;margin-top:2px}
.b2-wf .key{display:flex;gap:14px;font-size:.72rem;color:#8a9894;flex-wrap:wrap}
.b2-wf .key i{display:inline-block;width:18px;height:6px;border-radius:3px;margin-right:6px;vertical-align:1px}
.b2-wf .key b{font-family:var(--font-mono,ui-monospace,monospace);font-weight:600;color:#d7e0dd;margin-left:4px}
.blog-content .demo.bl-x.b2-wf ol{list-style:none;padding:10px 20px 14px;margin:0}
.b2-wf li{display:grid;grid-template-columns:22px minmax(0,1fr) 5.2rem;gap:12px;align-items:start;padding:8px 0;position:relative}
.b2-wf li::before{content:"";position:absolute;left:10px;top:0;bottom:0;width:2px;background:#2e6b3a;z-index:0}
.b2-wf li:first-child::before{top:18px}
.b2-wf li:last-child::before{bottom:calc(100% - 18px)}
.b2-wf .ic{width:22px;height:22px;border-radius:50%;background:#3fb950;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;margin-top:1px}
.b2-wf .ic svg{width:12px;height:12px;stroke:#0d1514;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.b2-wf .nm{font-size:.86rem;color:#f1f5f4}
.b2-wf .nm b{font-weight:500;color:#8a9894;margin-right:6px;font-variant-numeric:tabular-nums}
.b2-wf .nm small{color:#7d8c88;font-family:var(--font-mono,ui-monospace,monospace);font-size:.7rem;margin-left:8px}
.b2-wf .wt{font-size:.76rem;color:#8a9894;line-height:1.45;margin-top:2px}
.b2-wf .bar{display:flex;height:6px;border-radius:3px;overflow:hidden;margin-top:6px;background:#16211f}
.b2-wf .bar span{height:100%}
.b2-wf .d{font-family:var(--font-mono,ui-monospace,monospace);font-size:.78rem;text-align:right;color:#d7e0dd;line-height:1.35}
.b2-wf .d small{display:block;color:${AI};font-size:.7rem}
.b2-wf .ft{padding:12px 20px;border-top:1px solid #1f2c2a;font-size:.76rem;color:#8a9894;line-height:1.5}
@media (max-width:560px){.b2-wf li{grid-template-columns:22px minmax(0,1fr) 4.4rem;gap:10px}.b2-wf .nm small{display:block;margin:0}}
`;

const ICONS: Record<Step["icon"], string> = {
  plan: "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z",
  tool: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5",
  check: "M4 12l5 5L20 6",
  flag: "M5 21V4h11l-2 4 2 4H5",
};

export default function WorkflowPanel2() {
  return (
    <div className="demo bl-x b2-wf">
      <style>{BASE_CSS + CSS}</style>
      <div className="hd">
        <div>
          <div className="k">WORKFLOW</div>
          <div className="t">Bulletin part 2: UI rebuild</div>
          <div className="s">
            9 of 9 done · 9h 10m from first message to green CI
          </div>
        </div>
        <div className="key">
          <span>
            <i style={{ background: AI }} />
            AI<b>{fmt(sum("ai"))}</b>
          </span>
          <span>
            <i style={{ background: COMPUTE }} />
            compute<b>{fmt(sum("compute"))}</b>
          </span>
          <span>
            <i style={{ background: BLOCKED }} />
            blocked<b>{fmt(sum("blocked"))}</b>
          </span>
        </div>
      </div>
      <ol>
        {STEPS.map((s) => {
          const w = (m: number) => `${(m / MAX) * 100}%`;
          return (
            <li key={s.n}>
              <span className="ic">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ICONS[s.icon]} />
                </svg>
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="nm">
                  <b>{s.n}</b>
                  {s.name}
                  <small>{s.when}</small>
                </div>
                <div className="wt">{s.what}</div>
                <div
                  className="bar"
                  role="img"
                  aria-label={`AI ${fmt(s.ai)}, compute ${fmt(s.compute)}, blocked ${fmt(s.blocked)}`}
                >
                  <span style={{ width: w(s.ai), background: AI }} />
                  <span style={{ width: w(s.compute), background: COMPUTE }} />
                  <span style={{ width: w(s.blocked), background: BLOCKED }} />
                </div>
              </div>
              <span className="d">
                {fmt(total(s))}
                <small>AI {fmt(s.ai)}</small>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="ft">
        Rebuilt from the session transcripts. Steps 3–6 ran as two parallel
        tracks, so the steps add up to more than the 9h 10m of wall time. AI is
        Claude generating; compute is tool calls and background jobs (builds,
        Docker, test suites, screenshots, CI); blocked is an agent stopped and
        waiting on the orchestrator for a test slot, a review or Docker.
      </div>
    </div>
  );
}
