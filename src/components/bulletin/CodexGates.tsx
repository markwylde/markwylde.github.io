import { useState } from "react";
import { BASE_CSS, C } from "./bits";
import { CHANGES } from "./changes";

const MULTI = CHANGES.filter(
  (c) => c.trail.filter((t) => t[3] === 1).length >= 3,
);

// Codex model per roadmap change (1-based).
const MODEL = (n: number) =>
  n <= 10
    ? { m: "gpt-6.1-sol · low", c: "#4f9ef0" }
    : n <= 20
      ? n === 20
        ? { m: "astra, sol for the last gate", c: "#b58cf0" }
        : { m: "gpt-6-astra · medium", c: "#b58cf0" }
      : { m: "gpt-6.1-sol · medium", c: "#2f6fd0" };

const CSS = `
.bl-cg{display:flex;flex-direction:column;gap:28px}
.bl-cg h5{padding-bottom:10px;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.bl-cg .fun{display:flex;flex-direction:column;gap:6px}
.bl-cg .fr{display:grid;grid-template-columns:4.5rem 1fr 9.5rem;gap:10px;align-items:center;font-size:.82rem}
.bl-cg .fr .bar{display:flex;height:22px;border-radius:4px;overflow:hidden;background:var(--track)}
.bl-cg .fr .bar span{height:100%}
.bl-cg .fr b{color:var(--fg-strong);font-variant-numeric:tabular-nums}
.bl-cg .sel{display:flex;gap:6px;flex-wrap:wrap}
.bl-cg .sel button{font:inherit;font-size:.76rem;padding:3px 10px;border-radius:999px;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);cursor:pointer}
.bl-cg .sel button.on{border-color:var(--fg-strong);color:var(--fg-strong);font-weight:600}
.bl-cg .gates{display:flex;gap:8px;flex-wrap:wrap;padding-top:12px}
.bl-cg .g{width:68px;border-radius:8px;border:1px solid var(--line);padding:6px 4px;text-align:center;font-size:.72rem;color:var(--muted);background:var(--btn-bg)}
.bl-cg .g b{display:block;font-size:.9rem;margin-top:2px}
.bl-cg .g.clean b{color:${C.good}}
.bl-cg .g.p1{border-color:${C.p1}}
.bl-cg .g.p1 b{color:${C.p1}}
.bl-cg .g.p2 b{color:${C.p2}}
.bl-cg .models{display:flex;gap:2px}
.bl-cg .models span{flex:1;height:22px;border-radius:2px;font-size:.62rem;color:#fff;display:flex;align-items:center;justify-content:center}
.bl-cg .ml{display:flex;flex-wrap:wrap;gap:12px;font-size:.74rem;color:var(--muted);margin-top:6px}
.bl-cg .sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.bl-cg .note{font-size:.8rem;color:var(--muted);padding-top:8px}
`;

export default function CodexGates() {
  const [pick, setPick] = useState("public-api-webhooks");
  const c = MULTI.find((x) => x.name === pick) ?? MULTI[0];
  const gates = c.trail.filter((t) => t[3] === 1);
  const max = 87;
  return (
    <div className="demo bl-x bl-cg">
      <style>{BASE_CSS + CSS}</style>
      <div>
        <h5>P1s found in the driver's review rounds, all changes</h5>
        <div className="fun">
          {[
            { k: "Round 1", p1: 87, sec: 40 },
            { k: "Round 3", p1: 31, sec: 19 },
          ].map((r) => (
            <div className="fr" key={r.k}>
              <span>{r.k}</span>
              <span className="bar">
                <span
                  style={{ width: `${(r.sec / max) * 100}%`, background: C.p1 }}
                  title="security"
                />
                <span
                  style={{
                    width: `${((r.p1 - r.sec) / max) * 100}%`,
                    background: "#e98b9a",
                  }}
                />
              </span>
              <span>
                <b>{r.p1}</b> P1 · {r.sec} security
              </span>
            </div>
          ))}
        </div>
        <p className="note">
          Dark red is the share tagged [security]. Clean driver rounds in the
          whole build: 0 of 73.
        </p>
      </div>
      <div>
        <h5>Final gates, one box per Codex sign-off</h5>
        <div className="sel">
          {MULTI.map((x) => (
            <button
              type="button"
              key={x.name}
              className={x.name === c.name ? "on" : ""}
              onClick={() => setPick(x.name)}
            >
              {x.name}
            </button>
          ))}
        </div>
        <div className="gates">
          {gates.map(([p1, p2, clean], i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed order
              key={i}
              className={`g ${clean ? "clean" : p1 ? "p1" : "p2"}`}
            >
              gate {i + 1}
              <b>
                {clean
                  ? "clean"
                  : p1
                    ? `${p1} P1${p2 ? ` +${p2}` : ""}`
                    : `${p2} P2`}
              </b>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h5>Which model reviewed each change</h5>
        <div className="models">
          {Array.from({ length: 25 }, (_, i) => {
            const m = MODEL(i + 1);
            return (
              <span
                key={m.m + String(i)}
                style={{ background: m.c }}
                title={`${i + 1}: ${m.m}`}
              >
                {i + 1}
              </span>
            );
          })}
        </div>
        <div className="ml">
          <span>
            <i className="sw" style={{ background: "#4f9ef0" }} />
            gpt-6.1-sol, low effort (1–2 min)
          </span>
          <span>
            <i className="sw" style={{ background: "#b58cf0" }} />
            gpt-6-astra, medium
          </span>
          <span>
            <i className="sw" style={{ background: "#2f6fd0" }} />
            gpt-6.1-sol, medium (3–5 min)
          </span>
        </div>
      </div>
    </div>
  );
}
