import { useState } from "react";
import { BASE_CSS } from "../bulletin/bits";
import { COL, PRICES, USAGE, type Usage } from "./data";

type Rates = {
  input: number;
  write5m: number;
  write1h: number;
  read: number;
  output: number;
};

const SCENARIOS: {
  id: string;
  label: string;
  note: string;
  rates: (u: Usage) => Rates;
}[] = [
  {
    id: "actual",
    label: "As it ran",
    note: "Opus 5.5 at API list prices, Haiku 5.5 for the one page fetch.",
    rates: (u) => PRICES[u.model as keyof typeof PRICES],
  },
  {
    id: "nocache",
    label: "No prompt caching",
    note: "Every cached token billed as fresh input at $4 per million. The same work, 13 times the price.",
    rates: (u) => {
      const p = PRICES[u.model as keyof typeof PRICES];
      return {
        input: p.input,
        write5m: p.input,
        write1h: p.input,
        read: p.input,
        output: p.output,
      };
    },
  },
  {
    id: "sonnet",
    label: "Same tokens on Sonnet 5.5",
    note: "$2 input, $0.10 cache reads, $10 output. Sonnet would not use the same tokens for the same work, so treat this as a rough guide.",
    rates: () => ({
      input: 2,
      write5m: 2.5,
      write1h: 4,
      read: 0.1,
      output: 10,
    }),
  },
  {
    id: "fast",
    label: "Opus 5.5 fast mode",
    note: "Fast mode is twice the standard price. It would also have been quicker, but most of the day was spent waiting on Docker, not the model.",
    rates: (u) => {
      const p = PRICES[u.model as keyof typeof PRICES];
      return u.model === "Opus 5.5"
        ? {
            input: p.input * 2,
            write5m: p.write5m * 2,
            write1h: p.write1h * 2,
            read: p.read * 2,
            output: p.output * 2,
          }
        : p;
    },
  },
];

const CATS = [
  { k: "read", label: "Cache reads", colour: COL.claude },
  { k: "write5m", label: "Cache writes, 5 min", colour: "#c8794a" },
  { k: "write1h", label: "Cache writes, 1 hour", colour: "#9a5a33" },
  { k: "output", label: "Output", colour: "#5b7fe8" },
  { k: "input", label: "Uncached input", colour: COL.muted },
] as const;

const usd = (n: number) =>
  n >= 1000
    ? `$${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`
    : `$${n.toFixed(2)}`;
const tok = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${(n / 1e3).toFixed(0)}K`;

const CSS = `
.b2-cc{display:flex;flex-direction:column;gap:14px}
.b2-cc .seg{display:flex;flex-wrap:wrap;gap:6px}
.b2-cc .seg button{font:inherit;font-size:.8rem;padding:5px 11px;border:1px solid var(--line);border-radius:8px;background:var(--btn-bg);color:var(--fg);cursor:pointer}
.b2-cc .seg button[aria-pressed="true"]{background:var(--fg-strong);color:var(--btn-bg);border-color:var(--fg-strong)}
.b2-cc .total{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.b2-cc .total b{font-size:1.9rem;color:var(--fg-strong);font-variant-numeric:tabular-nums}
.b2-cc .total small{color:var(--muted);font-size:.82rem;max-width:40rem}
.b2-cc .stack{display:flex;height:22px;border-radius:6px;overflow:hidden;border:1px solid var(--line)}
.b2-cc .stack i{display:block;height:100%}
.b2-cc .legend{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.76rem;color:var(--muted)}
.b2-cc .legend b{color:var(--fg);font-weight:600;font-variant-numeric:tabular-nums}
.b2-cc .sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.blog-content .demo.b2-cc table{display:table;margin:0;width:100%;border-collapse:collapse;font-size:.8rem;font-variant-numeric:tabular-nums}
.blog-content .demo.b2-cc :is(th,td){background:none;border:0;padding:6px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
.blog-content .demo.b2-cc :is(th,td):first-child{text-align:left}
.blog-content .demo.b2-cc th{color:var(--muted);font-weight:500}
.b2-cc td.bar{width:30%;min-width:80px}
.b2-cc td.bar i{display:block;height:8px;border-radius:4px;background:${COL.claude}}
.b2-cc .wrap{overflow-x:auto}
@media (max-width:560px){.b2-cc .hide-sm{display:none}.blog-content .demo.b2-cc :is(th,td){padding:6px 4px}}
`;

export default function ClaudeCost() {
  const [sid, setSid] = useState("actual");
  const sc = SCENARIOS.find((s) => s.id === sid) ?? SCENARIOS[0];
  const rows = USAGE.map((u) => {
    const r = sc.rates(u);
    const parts = Object.fromEntries(
      CATS.map((c) => [c.k, (u[c.k] * r[c.k]) / 1e6]),
    ) as Record<(typeof CATS)[number]["k"], number>;
    const total = Object.values(parts).reduce((a, b) => a + b, 0);
    return { u, parts, total };
  });
  const grand = rows.reduce((a, r) => a + r.total, 0);
  const byCat = CATS.map((c) => ({
    ...c,
    v: rows.reduce((a, r) => a + r.parts[c.k], 0),
  }));
  const max = Math.max(...rows.map((r) => r.total));

  return (
    <div className="demo bl-x b2-cc">
      <style>{BASE_CSS + CSS}</style>
      <div className="seg">
        {SCENARIOS.map((s) => (
          <button
            type="button"
            key={s.id}
            aria-pressed={s.id === sid}
            onClick={() => setSid(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="total">
        <b>{usd(grand)}</b>
        <small>{sc.note}</small>
      </div>
      <div className="stack" role="img" aria-label="Cost by token type">
        {byCat.map((c) => (
          <i
            key={c.k}
            title={`${c.label}: ${usd(c.v)}`}
            style={{ width: `${(c.v / grand) * 100}%`, background: c.colour }}
          />
        ))}
      </div>
      <div className="legend">
        {byCat.map((c) => (
          <span key={c.k}>
            <i className="sw" style={{ background: c.colour }} />
            {c.label} <b>{usd(c.v)}</b>
          </span>
        ))}
      </div>
      <div className="wrap">
        <table>
          <thead>
            <tr>
              <th>Session</th>
              <th className="hide-sm">API calls</th>
              <th className="hide-sm">Cache reads</th>
              <th className="hide-sm">Output</th>
              <th>Cost</th>
              <th className="hide-sm" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.u.id}>
                <td>
                  {r.u.label}
                  {r.u.model !== "Opus 5.5" ? ` (${r.u.model})` : ""}
                </td>
                <td className="hide-sm">{r.u.calls.toLocaleString("en-GB")}</td>
                <td className="hide-sm">{tok(r.u.read)}</td>
                <td className="hide-sm">{tok(r.u.output)}</td>
                <td>{usd(r.total)}</td>
                <td className="bar hide-sm">
                  <i style={{ width: `${(r.total / max) * 100}%` }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
