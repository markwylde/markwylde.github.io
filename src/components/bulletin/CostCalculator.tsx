import { useState } from "react";
import { BASE_CSS } from "./bits";

// USD per 1M tokens, from each vendor's pricing page on 14 Nov 2026.
// "write" is what an uncached input token costs: Anthropic's 5-minute cache
// write, OpenAI's cache write, DeepSeek's cache miss.
const MODELS = [
  {
    id: "deepseek",
    label: "DeepSeek Flash (off-peak)",
    read: 0.003,
    write: 0.15,
    out: 0.6,
    color: "#2f9e6b",
  },
  {
    id: "deepseek-peak",
    label: "DeepSeek Flash (peak)",
    read: 0.006,
    write: 0.3,
    out: 1.2,
    color: "#6cc39a",
  },
  {
    id: "haiku",
    label: "Claude Haiku 5.5 (>100K prompt)",
    read: 0.05,
    write: 0.625,
    out: 2.5,
    color: "#b58cf0",
  },
  {
    id: "sonnet",
    label: "Claude Sonnet 5.5",
    read: 0.1,
    write: 2.5,
    out: 10,
    color: "#8a6cf0",
  },
  {
    id: "gpt",
    label: "gpt-6.1-sol (≤272K prompt)",
    read: 0.1,
    write: 2.5,
    out: 10,
    color: "#4f9ef0",
  },
  {
    id: "gpt-long",
    label: "gpt-6.1-sol (>272K prompt)",
    read: 0.2,
    write: 5,
    out: 15,
    color: "#2f6fd0",
  },
  {
    id: "opus",
    label: "Claude Opus 5.5",
    read: 0.2,
    write: 5,
    out: 20,
    color: "#5b3fc4",
  },
];

const TOKENS_M = 9955.557125; // DeepSeek dashboard total, in millions
const ACTUAL = 50.91; // $50.00 + ¥6.14

const CSS = `
.bl-cc{display:flex;flex-direction:column;gap:14px}
.bl-cc .sliders{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:12px 20px}
.bl-cc label{display:flex;flex-direction:column;gap:4px;font-size:.84rem}
.bl-cc label b{color:var(--fg-strong);font-variant-numeric:tabular-nums}
.bl-cc input[type=range]{width:100%}
.bl-cc .hint{font-size:.74rem;color:var(--muted)}
.bl-cc .rows{display:flex;flex-direction:column;gap:6px}
.bl-cc .row{display:grid;grid-template-columns:minmax(0,13rem) 1fr 5.2rem;gap:10px;align-items:center;font-size:.82rem}
.bl-cc .row .name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-cc .track{height:16px;background:var(--track);border-radius:3px;overflow:hidden}
.bl-cc .track span{display:block;height:100%}
.bl-cc .row .v{text-align:right;font-variant-numeric:tabular-nums;color:var(--fg-strong);font-weight:600}
.bl-cc .row.actual .v{color:#2f9e6b}
.bl-cc .presets{display:flex;flex-wrap:wrap;gap:6px}
.bl-cc .presets button{font:inherit;font-size:.78rem;padding:4px 10px;border-radius:999px;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);cursor:pointer}
.bl-cc .foot{font-size:.76rem;color:var(--muted);line-height:1.5}
@media (max-width:560px){.bl-cc .row{grid-template-columns:minmax(0,8rem) 1fr 4.6rem}}
`;

function money(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function CostCalculator() {
  const [cache, setCache] = useState(99);
  const [out, setOut] = useState(0.2);
  const outShare = Math.min(out, 100 - cache) / 100;
  const readShare = cache / 100;
  const writeShare = Math.max(0, 1 - readShare - outShare);
  const costs = MODELS.map((m) => ({
    ...m,
    cost:
      TOKENS_M * (readShare * m.read + writeShare * m.write + outShare * m.out),
  }));
  const max = Math.max(...costs.map((c) => c.cost), ACTUAL);
  const scale = (v: number) => `${Math.max(0.4, (v / max) * 100)}%`;

  return (
    <div className="demo bl-x bl-cc">
      <style>{BASE_CSS + CSS}</style>
      <div className="sliders">
        <label>
          <span>
            Share of tokens read from cache: <b>{cache.toFixed(1)}%</b>
          </span>
          <input
            type="range"
            min={80}
            max={99.7}
            step={0.1}
            value={cache}
            onChange={(e) => setCache(Number(e.target.value))}
          />
          <span className="hint">
            opencode recorded 99.7%. DeepSeek's bill implies 98.5–99%.
          </span>
        </label>
        <label>
          <span>
            Share of tokens that are output: <b>{out.toFixed(2)}%</b>
          </span>
          <input
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            value={out}
            onChange={(e) => setOut(Number(e.target.value))}
          />
          <span className="hint">
            opencode recorded 0.14% (incl. reasoning).
          </span>
        </label>
      </div>
      <div className="presets">
        <span className="hint" style={{ alignSelf: "center" }}>
          Presets:
        </span>
        <button
          type="button"
          onClick={() => {
            setCache(99);
            setOut(0.2);
          }}
        >
          This build (99%)
        </button>
        <button
          type="button"
          onClick={() => {
            setCache(95);
            setOut(0.2);
          }}
        >
          Typical agent (95%)
        </button>
        <button
          type="button"
          onClick={() => {
            setCache(90);
            setOut(0.2);
          }}
        >
          Poor caching (90%)
        </button>
      </div>
      <div className="rows">
        <div className="row actual">
          <span className="name">What I actually paid</span>
          <span className="track">
            <span style={{ width: scale(ACTUAL), background: "#2f9e6b" }} />
          </span>
          <span className="v">${ACTUAL.toFixed(2)}</span>
        </div>
        {costs.map((c) => (
          <div className="row" key={c.id}>
            <span className="name" title={c.label}>
              {c.label}
            </span>
            <span className="track">
              <span style={{ width: scale(c.cost), background: c.color }} />
            </span>
            <span className="v">{money(c.cost)}</span>
          </div>
        ))}
      </div>
      <p className="foot">
        9,955,557,125 tokens from DeepSeek's dashboard, priced at list rates
        with no batch discounts. Uncached input is billed as a cache write. This
        assumes the same token count on every model, which isn't true: a
        stronger model might loop less and use fewer tokens.
      </p>
    </div>
  );
}
