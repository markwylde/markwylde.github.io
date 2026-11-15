import { useState } from "react";
import { BASE_CSS, C } from "./bits";
import { CHANGES } from "./changes";

// Hours since Mon 9 Nov 00:00 (all times UTC, which was local time).
const T0 = Date.UTC(2026, 10, 9);
const h = (s: string) =>
  (Date.parse(`${s.replace(" ", "T")}:00Z`) - T0) / 3_600_000;
const START = h("2026-11-09 09:23");
const END = h("2026-11-14 22:58");
const SPAN_FROM = 0;
const SPAN_TO = 6 * 24;
const DAYS = ["Mon 9", "Tue 10", "Wed 11", "Thu 12", "Fri 13", "Sat 14"];

const EVENTS: { at: string; label: string; who: keyof typeof C }[] = [
  {
    at: "2026-11-09 09:23",
    label: "First message. Planning starts",
    who: "me",
  },
  {
    at: "2026-11-09 12:40",
    label: "“Go”: DeepSeek starts building",
    who: "me",
  },
  {
    at: "2026-11-09 21:50",
    label: "DeepSeek takes down my stack",
    who: "deepseek",
  },
  {
    at: "2026-11-10 19:15",
    label: "New merge rule: never merge a P1",
    who: "claude",
  },
  {
    at: "2026-11-12 14:11",
    label: "Moderation merges after 8 final gates",
    who: "codex",
  },
  {
    at: "2026-11-13 01:25",
    label: "DeepSeek balance runs out (1)",
    who: "deepseek",
  },
  {
    at: "2026-11-14 18:04",
    label: "Balance out again. Claude finishes",
    who: "claude",
  },
  { at: "2026-11-14 22:58", label: "Last merge", who: "claude" },
];

const STATS = [
  { v: "133.6 h", k: "first message to last merge" },
  { v: "25", k: "OpenSpec changes, 408 tasks" },
  { v: "518", k: "commits, ~274k lines" },
  { v: "9.96B", k: "DeepSeek tokens" },
  { v: "591", k: "Codex findings, 198 P1" },
  { v: "$50.91", k: "DeepSeek bill" },
];

const CSS = `
.bl-ag{display:flex;flex-direction:column;gap:18px}
.bl-ag .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:10px}
.bl-ag .tile{border:1px solid var(--line);border-radius:10px;padding:12px 14px;background:var(--btn-bg)}
.bl-ag .tile b{display:block;font-size:1.45rem;line-height:1.15;color:var(--fg-strong);font-variant-numeric:tabular-nums}
.bl-ag .tile.hl b{color:${C.good}}
.bl-ag .tile small{display:block;margin-top:4px;font-size:.76rem;line-height:1.35;color:var(--muted)}
.bl-ag .strip{position:relative;height:136px;margin:0 2px}
.bl-ag .days{position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr)}
.bl-ag .days div{border-left:1px dashed var(--line);font-size:.7rem;color:var(--muted);padding:0 0 0 4px}
.bl-ag .lane{position:absolute;left:0;right:0;height:22px}
.bl-ag .seg{position:absolute;padding:0;font:inherit;top:0;height:100%;border-radius:3px;cursor:pointer;border:1px solid rgba(0,0,0,.25);box-sizing:border-box}
.bl-ag .seg:hover,.bl-ag .seg.on{filter:brightness(1.25);outline:2px solid var(--fg-strong);outline-offset:1px}
.bl-ag .ev{position:absolute;top:84px;width:12px;height:12px;margin-left:-6px;border-radius:50%;border:2px solid var(--btn-bg);cursor:pointer;padding:0}
.bl-ag .ev:hover,.bl-ag .ev.on{transform:scale(1.35)}
.bl-ag .lbl{position:absolute;font-size:.68rem;color:var(--muted);white-space:nowrap}
.bl-ag .info{min-height:2.6em;font-size:.84rem;color:var(--fg);border-left:3px solid var(--line);padding:2px 0 2px 10px}
.bl-ag .info b{color:var(--fg-strong)}
.bl-ag .legend{display:flex;flex-wrap:wrap;gap:12px;font-size:.74rem;color:var(--muted)}
.bl-ag .sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
`;

const pct = (x: number) =>
  `${((x - SPAN_FROM) / (SPAN_TO - SPAN_FROM)) * 100}%`;

export default function AtAGlance() {
  const [sel, setSel] = useState<string>(
    "Hover or tap a block to see a change, or a dot to see what happened.",
  );
  const [on, setOn] = useState<string | null>(null);
  const planEnd = h("2026-11-09 12:40");
  const showPlan = () => {
    setOn("plan");
    setSel(
      "Planning: 3h17m with Claude. 62 questions, 20 ADRs, 25 OpenSpec changes, seven review rounds.",
    );
  };

  return (
    <div className="demo bl-x bl-ag">
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
        className="strip"
        role="img"
        aria-label="Timeline of the build from Monday 9 to Saturday 14 November"
      >
        <div className="days">
          {DAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="lane" style={{ top: 38 }}>
          <button
            type="button"
            aria-label="Planning"
            className={`seg${on === "plan" ? " on" : ""}`}
            style={{
              left: pct(START),
              width: `calc(${pct(planEnd)} - ${pct(START)})`,
              background: C.me,
            }}
            onMouseEnter={showPlan}
            onFocus={showPlan}
            onClick={showPlan}
          />
          {CHANGES.map((c, i) => {
            const s = h(c.start);
            const id = c.name;
            const sub = c.name === "operations-observability";
            const show = () => {
              setOn(id);
              setSel(
                `${c.n ?? "·"} ${c.name}: ${Math.floor(c.minutes / 60)}h${String(c.minutes % 60).padStart(2, "0")}m, ${c.gates} final gate${c.gates === 1 ? "" : "s"}. ${c.what}`,
              );
            };
            return (
              <button
                type="button"
                aria-label={c.name}
                key={id}
                className={`seg${on === id ? " on" : ""}`}
                style={{
                  left: pct(s),
                  width: `calc(${pct(s + c.minutes / 60)} - ${pct(s)})`,
                  background: sub ? C.claude : i % 2 ? "#8ea6f2" : C.deepseek,
                }}
                onMouseEnter={show}
                onFocus={show}
                onClick={show}
              />
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            top: 90,
            left: 0,
            right: 0,
            height: 1,
            background: "var(--line)",
          }}
        />
        {EVENTS.map((e) => (
          <button
            type="button"
            key={e.at}
            className={`ev${on === e.at ? " on" : ""}`}
            style={{ left: pct(h(e.at)), background: C[e.who] }}
            aria-label={e.label}
            onMouseEnter={() => {
              setOn(e.at);
              setSel(`${e.at.slice(5).replace("-", "/")} · ${e.label}`);
            }}
            onClick={() => {
              setOn(e.at);
              setSel(`${e.at.slice(5).replace("-", "/")} · ${e.label}`);
            }}
          />
        ))}
        <span className="lbl" style={{ top: 104, left: pct(START) }}>
          09:23 start
        </span>
        <span
          className="lbl"
          style={{ top: 120, right: `calc(100% - ${pct(END)})` }}
        >
          22:58 last merge
        </span>
      </div>
      <div className="info">{sel}</div>
      <div className="legend">
        <span>
          <i className="sw" style={{ background: C.me }} />
          Me
        </span>
        <span>
          <i className="sw" style={{ background: C.deepseek }} />
          DeepSeek building
        </span>
        <span>
          <i className="sw" style={{ background: C.codex }} />
          Codex
        </span>
        <span>
          <i className="sw" style={{ background: C.claude }} />
          Claude
        </span>
      </div>
    </div>
  );
}
