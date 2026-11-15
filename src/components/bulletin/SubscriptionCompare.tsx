import { useState } from "react";
import { BASE_CSS, C } from "./bits";

// Community estimates of tokens per week (billions), retrieved 14 Nov 2026.
// Neither vendor publishes token limits. See the post for sources.
const PLANS = [
  {
    id: "max",
    label: "Claude Max",
    price: 100,
    lo: 0.98,
    hi: 1.26,
    c: C.claude,
    src: "1 measured account (low) to Ultra's figure scaled by 5/10 (high)",
  },
  {
    id: "ultra",
    label: "Claude Ultra",
    price: 200,
    lo: 2.52,
    hi: 2.52,
    c: "#c4602f",
    src: "21 accounts, 2–9 Nov",
  },
  {
    id: "pro100",
    label: "ChatGPT Pro",
    price: 100,
    lo: 0.81,
    hi: 1.62,
    c: C.codex,
    src: "Pro $200 × 5/20, high end ×2 for the 29 Oct doubling",
  },
  {
    id: "pro200",
    label: "ChatGPT Pro",
    price: 200,
    lo: 3.23,
    hi: 6.46,
    c: "#1f6e61",
    src: "7 accounts, 26 Oct–2 Nov; high end ×2 for the doubling",
  },
];
const TOKENS_B = 9.96;
const WEEKS_PER_MONTH = 4.345;
const ACTUAL_WEEKS = 133.6 / 168;

const CSS = `
.bl-sc{display:flex;flex-direction:column;gap:16px}
.bl-sc .chips{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:8px}
.bl-sc .chip{font:inherit;text-align:left;border:1px solid var(--line);border-left:4px solid var(--c);border-radius:8px;padding:8px 10px;background:var(--btn-bg);color:var(--fg);cursor:pointer;opacity:.55}
.bl-sc .chip.on{opacity:1;box-shadow:0 0 0 1px var(--c)}
.bl-sc .chip b{display:block;color:var(--fg-strong);font-size:.88rem}
.bl-sc .chip span{font-size:.74rem;color:var(--muted)}
.bl-sc h5{padding-bottom:8px;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.bl-sc .rows{display:flex;flex-direction:column;gap:6px}
.bl-sc .r{display:grid;grid-template-columns:minmax(0,10rem) 1fr 7.5rem;gap:10px;align-items:center;font-size:.8rem}
.bl-sc .r .t{position:relative;height:18px;background:var(--track);border-radius:3px}
.bl-sc .r .t span{position:absolute;top:0;height:100%;border-radius:3px}
.bl-sc .r .t span.lo{opacity:1}
.bl-sc .r .t span.hi{opacity:.4}
.bl-sc .r .v{text-align:right;font-variant-numeric:tabular-nums;color:var(--fg-strong);font-weight:600}
.bl-sc .foot{font-size:.74rem;color:var(--muted);margin:0;line-height:1.5}
@media (max-width:560px){.bl-sc .r{grid-template-columns:minmax(0,6.5rem) 1fr 6rem}}
`;

const fmtW = (w: number) =>
  w < 1 ? `${(w * 7).toFixed(1)} days` : `${w.toFixed(1)} wk`;
const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${Math.round(n)}`;

export default function SubscriptionCompare() {
  const [sel, setSel] = useState<string[]>(["max", "pro100"]);
  const chosen = PLANS.filter((p) => sel.includes(p.id));
  const lo = chosen.reduce((a, p) => a + p.lo, 0);
  const hi = chosen.reduce((a, p) => a + p.hi, 0);
  const monthly = chosen.reduce((a, p) => a + p.price, 0);
  const wMax = lo ? TOKENS_B / lo : 0; // slowest
  const wMin = hi ? TOKENS_B / hi : 0; // fastest
  const costLo = (wMin / WEEKS_PER_MONTH) * monthly;
  const costHi = (wMax / WEEKS_PER_MONTH) * monthly;

  const timeRows = [
    {
      k: "DeepSeek, actual",
      a: ACTUAL_WEEKS,
      b: ACTUAL_WEEKS,
      c: C.deepseek,
    },
    ...PLANS.filter((p) => sel.includes(p.id)).map((p) => ({
      k: `${p.label} $${p.price}`,
      a: TOKENS_B / p.hi,
      b: TOKENS_B / p.lo,
      c: p.c,
    })),
    ...(chosen.length > 1
      ? [{ k: "Selected together", a: wMin, b: wMax, c: "#8a6cf0" }]
      : []),
  ];
  const tMax = Math.max(...timeRows.map((r) => r.b), 1);

  const costRows = [
    { k: "DeepSeek bill", a: 50.91, b: 50.91, c: C.deepseek },
    ...(chosen.length
      ? [{ k: "Selected subscriptions", a: costLo, b: costHi, c: "#8a6cf0" }]
      : []),
    { k: "Sonnet 5.5 API", a: 1384, b: 1384, c: "#9a86d8" },
    { k: "Opus 5.5 API", a: 2768, b: 2768, c: "#5b3fc4" },
  ];
  const cMax = Math.max(...costRows.map((r) => r.b));

  const toggle = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="demo bl-x bl-sc">
      <style>{BASE_CSS + CSS}</style>
      <div className="chips">
        {PLANS.map((p) => (
          <button
            type="button"
            key={p.id}
            className={`chip${sel.includes(p.id) ? " on" : ""}`}
            style={{ ["--c" as string]: p.c }}
            onClick={() => toggle(p.id)}
            aria-pressed={sel.includes(p.id)}
          >
            <b>
              {p.label} · ${p.price}/mo
            </b>
            <span>
              ~{p.lo === p.hi ? p.lo : `${p.lo}–${p.hi}`}B tokens/week
            </span>
          </button>
        ))}
      </div>
      <div>
        <h5>Time to use 9.96B tokens</h5>
        <div className="rows">
          {timeRows.map((r) => (
            <div className="r" key={r.k}>
              <span>{r.k}</span>
              <span className="t">
                <span
                  className="hi"
                  style={{
                    left: 0,
                    width: `${(r.b / tMax) * 100}%`,
                    background: r.c,
                  }}
                />
                <span
                  className="lo"
                  style={{
                    left: 0,
                    width: `${Math.max(0.8, (r.a / tMax) * 100)}%`,
                    background: r.c,
                  }}
                />
              </span>
              <span className="v">
                {r.a === r.b
                  ? fmtW(r.a)
                  : `${r.a.toFixed(1)}–${r.b.toFixed(1)} wk`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h5>What that costs</h5>
        <div className="rows">
          {costRows.map((r) => (
            <div className="r" key={r.k}>
              <span>{r.k}</span>
              <span className="t">
                <span
                  className="hi"
                  style={{
                    left: 0,
                    width: `${(r.b / cMax) * 100}%`,
                    background: r.c,
                  }}
                />
                <span
                  className="lo"
                  style={{
                    left: 0,
                    width: `${Math.max(0.8, (r.a / cMax) * 100)}%`,
                    background: r.c,
                  }}
                />
              </span>
              <span className="v">
                {r.a === r.b ? money(r.a) : `${money(r.a)}–${money(r.b)}`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="foot">
        Tokens per week are community estimates from small samples; neither
        vendor publishes limits in tokens. Faded bars show the slow end of each
        range. Subscription cost is the monthly fee prorated over the weeks, and
        assumes you can keep every weekly cap saturated. API prices assume a 99%
        cache-read share, like this build.
      </p>
    </div>
  );
}
