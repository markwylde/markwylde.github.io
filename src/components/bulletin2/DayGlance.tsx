import { useState } from "react";
import { BASE_CSS } from "../bulletin/bits";
import { CI, COL, EVENTS, LANES } from "./data";

const m = (t: string) => {
  const [h, mm] = t.split(":").map(Number);
  return h * 60 + mm;
};
const FROM = m("10:30");
const TO = m("20:20");
const pct = (t: string) => `${((m(t) - FROM) / (TO - FROM)) * 100}%`;
const wid = (a: string, b: string) => `${((m(b) - m(a)) / (TO - FROM)) * 100}%`;
const HOURS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const STATS = [
  { v: "9h10m", k: "first message to green CI" },
  { v: "8 min", k: "of planning, six questions" },
  { v: "5", k: "Claude subagents, two in parallel" },
  { v: "47", k: "commits, +27.2k / −12.4k lines" },
  { v: "461.6M", k: "tokens, 98.5% cache reads" },
  { v: "$144.49", k: "at API list prices" },
];

const CSS = `
.b2-dg{display:flex;flex-direction:column;gap:16px}
.b2-dg .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,8.5rem),1fr));gap:10px}
.b2-dg .tile{border:1px solid var(--line);border-radius:10px;padding:12px 14px;background:var(--btn-bg)}
.b2-dg .tile b{display:block;font-size:1.45rem;line-height:1.15;color:var(--fg-strong);font-variant-numeric:tabular-nums}
.b2-dg .tile.hl b{color:${COL.claude}}
.b2-dg .tile small{display:block;margin-top:4px;font-size:.76rem;line-height:1.35;color:var(--muted)}
.b2-dg .chart{display:grid;grid-template-columns:5.6rem 1fr;row-gap:6px;align-items:center;font-size:.72rem;color:var(--muted)}
.b2-dg .track{position:relative;height:20px}
.b2-dg .grid{position:absolute;inset:0;pointer-events:none}
.b2-dg .grid i{position:absolute;top:-4px;bottom:-4px;border-left:1px dashed var(--line)}
.b2-dg .bar{position:absolute;top:2px;height:16px;border-radius:3px;border:0;padding:0;cursor:pointer;font:inherit}
.b2-dg .bar:hover,.b2-dg .bar.on,.b2-dg .dot:hover,.b2-dg .dot.on{outline:2px solid var(--fg-strong);outline-offset:1px}
.b2-dg .dot{position:absolute;top:4px;width:12px;height:12px;margin-left:-6px;border-radius:50%;border:2px solid var(--btn-bg);padding:0;cursor:pointer}
.b2-dg .axis{position:relative;height:14px}
.b2-dg .axis span{position:absolute;transform:translateX(-50%);font-size:.66rem}
.b2-dg .info{min-height:2.8em;font-size:.84rem;color:var(--fg);border-left:3px solid var(--line);padding:2px 0 2px 10px}
.b2-dg .info b{color:var(--fg-strong)}
.b2-dg .legend{display:flex;flex-wrap:wrap;gap:12px;font-size:.74rem;color:var(--muted)}
.b2-dg .sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
@media (max-width:560px){.b2-dg .chart{grid-template-columns:4.4rem 1fr}.b2-dg .axis span:nth-child(even){display:none}}
`;

function Grid() {
  return (
    <div className="grid">
      {HOURS.map((h) => (
        <i key={h} style={{ left: pct(`${h}:00`) }} />
      ))}
    </div>
  );
}

const ciColour = { success: COL.good, failure: COL.bad, cancelled: COL.muted };
const dotColour = {
  me: COL.me,
  claude: COL.claude,
  bad: COL.bad,
  good: COL.good,
};

export default function DayGlance() {
  const [on, setOn] = useState<string | null>(null);
  const [info, setInfo] = useState<string>(
    "Hover or tap a bar or a dot. Times are on Sunday 15 November.",
  );
  const pick = (id: string, text: string) => () => {
    setOn(id);
    setInfo(text);
  };

  return (
    <div className="demo bl-x b2-dg">
      <style>{BASE_CSS + CSS}</style>
      <div className="tiles">
        {STATS.map((s) => (
          <div className={`tile${s.v.startsWith("$") ? " hl" : ""}`} key={s.k}>
            <b>{s.v}</b>
            <small>{s.k}</small>
          </div>
        ))}
      </div>
      <div
        className="chart"
        role="img"
        aria-label="Timeline of the UI rebuild from 10:30 to 20:20"
      >
        <span>Events</span>
        <div className="track">
          <Grid />
          {EVENTS.map((e) => (
            <button
              type="button"
              key={e.at}
              aria-label={e.label}
              className={`dot${on === e.at ? " on" : ""}`}
              style={{ left: pct(e.at), background: dotColour[e.who] }}
              onMouseEnter={pick(e.at, `${e.at} · ${e.label}`)}
              onFocus={pick(e.at, `${e.at} · ${e.label}`)}
              onClick={pick(e.at, `${e.at} · ${e.label}`)}
            />
          ))}
        </div>
        {LANES.map((l) => (
          <div key={l.id} style={{ display: "contents" }}>
            <span>{l.label}</span>
            <div className="track">
              <Grid />
              {l.bars.map((b) => {
                const id = `${l.id}${b.from}`;
                const text = `${b.from}–${b.to} · ${b.note}`;
                return (
                  <button
                    type="button"
                    key={id}
                    aria-label={`${l.label} ${b.from} to ${b.to}`}
                    className={`bar${on === id ? " on" : ""}`}
                    style={{
                      left: pct(b.from),
                      width: wid(b.from, b.to),
                      background: l.id === "main" ? COL.claudeDark : COL.claude,
                    }}
                    onMouseEnter={pick(id, text)}
                    onFocus={pick(id, text)}
                    onClick={pick(id, text)}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <span>CI on main</span>
        <div className="track">
          <Grid />
          {CI.map((r) => {
            const text = `${r.from}–${r.to} · ${r.sha} · ${r.result}. ${r.note}`;
            return (
              <button
                type="button"
                key={r.sha}
                aria-label={`CI run ${r.sha}: ${r.result}`}
                className={`bar${on === r.sha ? " on" : ""}`}
                style={{
                  left: pct(r.from),
                  width: wid(r.from, r.to),
                  background: ciColour[r.result],
                }}
                onMouseEnter={pick(r.sha, text)}
                onFocus={pick(r.sha, text)}
                onClick={pick(r.sha, text)}
              />
            );
          })}
        </div>
        <span />
        <div className="axis">
          {HOURS.map((h) => (
            <span key={h} style={{ left: pct(`${h}:00`) }}>
              {h}:00
            </span>
          ))}
        </div>
      </div>
      <div className="info">{info}</div>
      <div className="legend">
        <span>
          <i className="sw" style={{ background: COL.claudeDark }} />
          Main Claude session
        </span>
        <span>
          <i className="sw" style={{ background: COL.claude }} />
          Claude subagents
        </span>
        <span>
          <i className="sw" style={{ background: COL.good }} />
          CI green
        </span>
        <span>
          <i className="sw" style={{ background: COL.bad }} />
          CI red
        </span>
        <span>
          <i className="sw" style={{ background: COL.me }} />
          Me
        </span>
      </div>
    </div>
  );
}
