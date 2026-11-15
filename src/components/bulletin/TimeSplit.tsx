import { useState } from "react";
import { BASE_CSS } from "./bits";

// Hours of DeepSeek's 103.9 h of assistant activity.
const PARTS = [
  { k: "Docker builds and stack restarts", v: 23.7, c: "#6b7fa8", runs: "" },
  { k: "Database integration suite", v: 19.5, c: "#8a6cf0", runs: "950 runs" },
  { k: "E2E suite", v: 14.7, c: "#c46bb0", runs: "1,307 runs" },
  { k: "Unit tests and checks", v: 3.5, c: "#4f9ef0", runs: "" },
  { k: "Other shell commands", v: 15.9, c: "#7c8597", runs: "" },
  { k: "The model thinking and writing", v: 26.6, c: "#5b7fe8", runs: "" },
];
const TOTAL = 103.9;

const CSS = `
.bl-ts{display:flex;flex-direction:column;gap:10px}
.bl-ts .bar{display:flex;height:34px;border-radius:6px;overflow:hidden}
.bl-ts .bar span{height:100%;cursor:pointer;transition:opacity .15s;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.72rem;font-weight:700;overflow:hidden;white-space:nowrap}
.bl-ts .bar.dim span{opacity:.35}
.bl-ts .bar.dim span.on{opacity:1}
.bl-ts .brace{display:flex;font-size:.74rem;color:var(--muted)}
.bl-ts .brace div{border-top:2px solid var(--line);padding-top:4px;text-align:center}
.bl-ts ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(19rem,1fr));gap:4px 24px}
.bl-ts li{display:flex;gap:8px;align-items:center;font-size:.82rem;margin:0;cursor:default;padding:2px 4px;border-radius:4px}
.bl-ts li.on{background:var(--pad-fill)}
.bl-ts li .sw{width:10px;height:10px;border-radius:2px;flex-shrink:0}
.bl-ts li b{margin-left:auto;font-variant-numeric:tabular-nums;color:var(--fg-strong)}
.bl-ts li small{color:var(--muted)}
`;

export default function TimeSplit() {
  const [on, setOn] = useState<string | null>(null);
  const shell = TOTAL - 26.6;
  return (
    <div className="demo bl-x bl-ts">
      <style>{BASE_CSS + CSS}</style>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover highlight only; the list below has the same data */}
      <div
        className={`bar${on ? " dim" : ""}`}
        onMouseLeave={() => setOn(null)}
      >
        {PARTS.map((p) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: hover highlight only
          <span
            key={p.k}
            className={on === p.k ? "on" : ""}
            style={{ width: `${(p.v / TOTAL) * 100}%`, background: p.c }}
            title={`${p.k}: ${p.v} h`}
            onMouseEnter={() => setOn(p.k)}
          >
            {p.v >= 10 ? `${p.v}h` : ""}
          </span>
        ))}
      </div>
      <div className="brace">
        <div style={{ width: `${(shell / TOTAL) * 100}%`, marginRight: 4 }}>
          Waiting on shell commands: {shell.toFixed(1)} h
        </div>
        <div style={{ flex: 1 }}>The model: ~27 h</div>
      </div>
      <ul onMouseLeave={() => setOn(null)}>
        {PARTS.map((p) => (
          <li
            key={p.k}
            className={on === p.k ? "on" : ""}
            onMouseEnter={() => setOn(p.k)}
          >
            <span className="sw" style={{ background: p.c }} />
            {p.k} {p.runs && <small>({p.runs})</small>}
            <b>{p.v}h</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
