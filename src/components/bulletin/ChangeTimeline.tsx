import { useState } from "react";
import { BASE_CSS } from "./bits";
import { CHANGES } from "./changes";

const CSS = `
.bl-ct{display:flex;flex-direction:column;gap:14px}
.bl-ct .controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.bl-ct .controls button{font:inherit;font-size:.82rem;padding:5px 11px;border-radius:999px;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);cursor:pointer}
.bl-ct .controls button[aria-pressed="true"]{border-color:var(--fg-strong);color:var(--fg-strong);font-weight:600}
.bl-ct .legend{display:flex;gap:14px;font-size:.78rem;color:var(--muted);flex-wrap:wrap}
.bl-ct .sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.bl-ct .rows{display:flex;flex-direction:column;gap:3px}
.bl-ct .row{display:grid;grid-template-columns:minmax(0,11.5rem) 1fr 3.6rem;gap:8px;align-items:center;background:none;border:none;padding:3px 4px;border-radius:6px;cursor:pointer;font:inherit;color:var(--fg);text-align:left}
.bl-ct .row:hover,.bl-ct .row.active{background:var(--pad-fill)}
.bl-ct .row.active .label{color:var(--fg-strong);font-weight:600}
.bl-ct .label{font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-ct .label .num{color:var(--muted);font-variant-numeric:tabular-nums;display:inline-block;width:1.6rem}
.bl-ct .bar{display:flex;height:14px;border-radius:3px;overflow:hidden;background:var(--track)}
.bl-ct .bar span{height:100%}
.bl-ct .dur{font-size:.76rem;color:var(--muted);font-variant-numeric:tabular-nums;text-align:right}
.bl-ct .detail{border:1px solid var(--line);border-radius:10px;padding:16px 18px;background:var(--code-bg)}
.bl-ct .detail h4{padding-bottom:2px;font-size:1.05rem;color:var(--fg-strong)}
.bl-ct .detail .what{padding-bottom:12px;font-size:.9rem;color:var(--muted)}
.bl-ct .stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5rem,1fr));gap:8px;margin-bottom:12px}
.bl-ct .stat{background:var(--btn-bg);border:1px solid var(--line);border-radius:8px;padding:7px 9px}
.bl-ct .stat b{display:block;font-size:1rem;color:var(--fg-strong);font-variant-numeric:tabular-nums}
.bl-ct .stat small{font-size:.72rem;color:var(--muted)}
.bl-ct .trail{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 12px}
.bl-ct .pill{font-size:.72rem;padding:2px 7px;border-radius:999px;border:1px solid var(--line);font-variant-numeric:tabular-nums;background:var(--btn-bg)}
.bl-ct .pill.p1{border-color:#d9485f;color:#d9485f}
.bl-ct .pill.clean{border-color:#2f9e6b;color:#2f9e6b}
.bl-ct .pill.gate{border-style:dashed}
.bl-ct .notes{font-size:.86rem;line-height:1.55;margin:0}
.bl-ct .k{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);padding-bottom:4px}
`;

const DRIVER = "#4f7cf0";
const GATE = "#f0a04f";
const OTHER = "#9aa3b5";

function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

type Sort = "order" | "duration" | "p1" | "gates";

export default function ChangeTimeline() {
  const [sort, setSort] = useState<Sort>("order");
  const [active, setActive] = useState("moderation");
  const max = Math.max(...CHANGES.map((c) => c.minutes));
  const rows = [...CHANGES];
  if (sort === "duration") rows.sort((a, b) => b.minutes - a.minutes);
  if (sort === "p1") rows.sort((a, b) => b.p1 - a.p1);
  if (sort === "gates") rows.sort((a, b) => b.gates - a.gates);
  const c = CHANGES.find((x) => x.name === active) ?? CHANGES[0];

  return (
    <div className="demo bl-x bl-ct">
      <style>{BASE_CSS + CSS}</style>
      <div className="controls">
        <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>Sort:</span>
        {(
          [
            ["order", "Build order"],
            ["duration", "Longest"],
            ["gates", "Most final gates"],
            ["p1", "Most P1 findings"],
          ] as [Sort, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={sort === k}
            onClick={() => setSort(k)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="legend">
        <span>
          <i className="sw" style={{ background: DRIVER }} />
          DeepSeek driver (task groups + 3 review/fix rounds)
        </span>
        <span>
          <i className="sw" style={{ background: GATE }} />
          Final gates and Claude steering
        </span>
        <span>
          <i className="sw" style={{ background: OTHER }} />
          Built by Claude subagents
        </span>
      </div>
      <div className="rows">
        {rows.map((r) => {
          const other = r.driverMin + r.gateMin === 0 ? r.minutes : 0;
          return (
            <button
              type="button"
              key={r.name}
              className={`row${r.name === active ? " active" : ""}`}
              onClick={() => setActive(r.name)}
            >
              <span className="label">
                <span className="num">{r.n ?? "·"}</span>
                {r.name}
              </span>
              <span className="bar">
                <span
                  style={{
                    width: `${(r.driverMin / max) * 100}%`,
                    background: DRIVER,
                  }}
                />
                <span
                  style={{
                    width: `${(r.gateMin / max) * 100}%`,
                    background: GATE,
                  }}
                />
                <span
                  style={{
                    width: `${(other / max) * 100}%`,
                    background: OTHER,
                  }}
                />
              </span>
              <span className="dur">{fmt(r.minutes)}</span>
            </button>
          );
        })}
      </div>
      <div className="detail">
        <h4>
          {c.n ? `${c.n}. ` : ""}
          {c.name}
        </h4>
        <p className="what">{c.what}</p>
        <div className="stats">
          <div className="stat">
            <b>{fmt(c.minutes)}</b>
            <small>wall clock</small>
          </div>
          <div className="stat">
            <b>
              {c.groups} / {c.tasks}
            </b>
            <small>task groups / tasks</small>
          </div>
          <div className="stat">
            <b>{c.runs}</b>
            <small>opencode runs ({c.steers} steers)</small>
          </div>
          <div className="stat">
            <b>{c.gates}</b>
            <small>final gates</small>
          </div>
          <div className="stat">
            <b>
              {c.p1} / {c.p2}
            </b>
            <small>Codex P1 / P2 (raw)</small>
          </div>
          <div className="stat">
            <b>{c.sec ?? "–"}</b>
            <small>tagged [security]</small>
          </div>
          <div className="stat">
            <b>{c.tokensM ? `${c.tokensM}M` : "–"}</b>
            <small>DeepSeek tokens</small>
          </div>
          <div className="stat">
            <b>{c.cost ? `$${c.cost.toFixed(2)}` : "–"}</b>
            <small>DeepSeek cost (opencode)</small>
          </div>
          <div className="stat">
            <b>{c.commits}</b>
            <small>commits</small>
          </div>
          <div className="stat">
            <b>+{c.added.toLocaleString()}</b>
            <small>lines added</small>
          </div>
        </div>
        <p className="k">Codex reviews in order (P1/P2)</p>
        <div className="trail">
          {c.trail.map(([p1, p2, clean, gate], i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed order
              key={i}
              className={`pill${clean ? " clean" : p1 ? " p1" : ""}${gate ? " gate" : ""}`}
              title={gate ? "final gate" : "driver review round"}
            >
              {clean ? "clean" : `${p1}/${p2}`}
            </span>
          ))}
        </div>
        <p className="k">From the logs</p>
        <p className="notes">{c.notes}</p>
      </div>
      <p style={{ fontSize: ".78rem", color: "var(--muted)", margin: 0 }}>
        Solid pills are the driver's review rounds; dashed pills are final
        gates. Red means at least one P1.
      </p>
    </div>
  );
}
