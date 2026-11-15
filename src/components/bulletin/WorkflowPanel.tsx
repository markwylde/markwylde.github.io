import { BASE_CSS } from "./bits";
import { CHANGES } from "./changes";

// The Terminay workflow, rebuilt with durations from the session logs and
// each bar split into time waiting on compute and time waiting on a model.
const STEPS = CHANGES.filter((c) => c.n !== null);
const SPIKES = new Set(["plugin-sandbox-spike", "rendering-and-caching"]);
// Minutes the build waited on a model: DeepSeek generating (assistant spans
// from the opencode session logs) plus Codex reviewing. operations-observability
// ran after the DeepSeek balance ran out: 71m of Claude subagent generation
// plus 17m of Codex review. The rest of each
// change's wall time was tool runs: Docker, tests, builds, gate scripts.
const AI: Record<string, number> = {
  "feature-flags": 34,
  "foundation-dev-environment": 84,
  "i18n-foundation": 41,
  "identity-sessions": 100,
  "plugin-sandbox-spike": 68,
  "attachments-avatars": 99,
  "content-pipeline": 111,
  conversations: 61,
  "events-notifications": 103,
  "forum-structure": 90,
  "groups-permissions": 72,
  "member-profiles": 80,
  moderation: 192,
  "plugin-platform": 177,
  "privacy-gdpr": 85,
  "public-api-webhooks": 92,
  "pwa-push": 89,
  "rendering-and-caching": 158,
  "reactions-reputation": 67,
  search: 50,
  "seo-feeds": 33,
  themes: 72,
  "topics-posts": 89,
  "staff-console-shell": 64,
  "operations-observability": 88,
};
const MAX = Math.max(...STEPS.map((c) => c.minutes));
const AI_TOTAL = STEPS.reduce((a, c) => a + AI[c.name], 0);
const COMPUTE_TOTAL = STEPS.reduce((a, c) => a + c.minutes - AI[c.name], 0);
const COMPUTE = "#3fb950";
const MODEL = "#8b9cf7";

const fmt = (m: number) =>
  `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;

const CSS = `
.bl-wf{background:#0d1514;border:1px solid #1f2c2a;border-radius:12px;color:#d7e0dd;overflow:hidden}
.bl-wf .hd{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 20px;align-items:flex-end;padding:16px 20px 14px;border-bottom:1px solid #1f2c2a}
.bl-wf .k{font-size:.66rem;letter-spacing:.12em;font-weight:700;color:#7d8c88}
.bl-wf .t{font-family:var(--font-mono,ui-monospace,monospace);font-weight:700;font-size:.95rem;color:#f1f5f4;margin-top:2px}
.bl-wf .s{font-size:.78rem;color:#8a9894;margin-top:2px}
.bl-wf .key{display:flex;gap:14px;font-size:.72rem;color:#8a9894;flex-wrap:wrap}
.bl-wf .key i{display:inline-block;width:18px;height:6px;border-radius:3px;margin-right:6px;vertical-align:1px}
.bl-wf .key b{font-family:var(--font-mono,ui-monospace,monospace);font-weight:600;color:#d7e0dd;margin-left:4px}
.bl-wf .cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;padding:10px 20px 14px}
.bl-wf ol{list-style:none}
.bl-wf li{display:grid;grid-template-columns:22px minmax(0,1fr) 4.6rem;gap:10px;align-items:center;padding:6px 0;position:relative}
.bl-wf li::before{content:"";position:absolute;left:10px;top:-4px;bottom:-4px;width:2px;background:#2e6b3a;z-index:0}
.bl-wf li:first-child::before{top:50%}
.bl-wf li:last-child::before{bottom:50%}
.bl-wf .ic{width:22px;height:22px;border-radius:50%;background:#3fb950;display:flex;align-items:center;justify-content:center;position:relative;z-index:1}
.bl-wf .ic svg{width:12px;height:12px;stroke:#0d1514;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.bl-wf .nm{font-size:.84rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-wf .nm b{font-weight:500;color:#8a9894;margin-right:6px;font-variant-numeric:tabular-nums}
.bl-wf .bar{display:flex;height:5px;border-radius:3px;overflow:hidden;margin-top:4px;opacity:.8}
.bl-wf .bar span{height:100%}
.bl-wf .d{font-family:var(--font-mono,ui-monospace,monospace);font-size:.76rem;text-align:right;color:#d7e0dd;line-height:1.25}
.bl-wf .ft{padding:12px 20px;border-top:1px solid #1f2c2a;font-size:.76rem;color:#8a9894;line-height:1.5}
@media (max-width:640px){.bl-wf .cols{grid-template-columns:1fr}.bl-wf ol + ol li:first-child::before{top:-4px}}
`;

const Code = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
  </svg>
);
const Flask = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
  </svg>
);

function Step({ c }: { c: (typeof STEPS)[number] }) {
  const ai = AI[c.name];
  const w = (m: number) => `${(m / MAX) * 100}%`;
  const tip = `${c.what} Compute ${fmt(c.minutes - ai)}, AI ${fmt(ai)}.`;
  return (
    <li title={tip}>
      <span className="ic">{SPIKES.has(c.name) ? <Flask /> : <Code />}</span>
      <div style={{ minWidth: 0 }}>
        <div className="nm">
          <b>{c.n}</b>
          {c.name}
        </div>
        <div className="bar">
          <span style={{ width: w(c.minutes - ai), background: COMPUTE }} />
          <span style={{ width: w(ai), background: MODEL }} />
        </div>
      </div>
      <span className="d">{fmt(c.minutes)}</span>
    </li>
  );
}

export default function WorkflowPanel() {
  const half = Math.ceil(STEPS.length / 2);
  return (
    <div className="demo bl-x bl-wf">
      <style>{BASE_CSS + CSS}</style>
      <div className="hd">
        <div>
          <div className="k">WORKFLOW</div>
          <div className="t">Bulletin build: 25 OpenSpec changes</div>
          <div className="s">
            25 of 25 done · 130h 15m from first DeepSeek commit to last merge
          </div>
        </div>
        <div className="key">
          <span>
            <i style={{ background: COMPUTE }} />
            waiting on compute<b>{fmt(COMPUTE_TOTAL)}</b>
          </span>
          <span>
            <i style={{ background: MODEL }} />
            waiting on AI<b>{fmt(AI_TOTAL)}</b>
          </span>
        </div>
      </div>
      <div className="cols">
        <ol>
          {STEPS.slice(0, half).map((c) => (
            <Step key={c.name} c={c} />
          ))}
        </ol>
        <ol>
          {STEPS.slice(half).map((c) => (
            <Step key={c.name} c={c} />
          ))}
        </ol>
      </div>
      <div className="ft">
        Rebuilt from the session logs, archive commit to archive commit. Compute
        is builds, tests, Docker and the gate scripts; AI is DeepSeek thinking
        and writing plus Codex reviewing. Compute also absorbs short idle gaps
        and Claude's steering. The DeepSeek balance ran out during seo-feeds, so
        operations-observability's AI time is a Claude subagent writing plus
        Codex reviewing. The 24-minute dev-stack-isolation change wasn't a
        workflow step and isn't shown.
      </div>
    </div>
  );
}
