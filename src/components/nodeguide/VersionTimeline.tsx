import { useState } from "react";
import { TIMELINE, VERSION_COLOR } from "./data";

const CSS = `
.ng-timeline{display:flex;flex-direction:column;gap:18px}
.ng-timeline .caption{font-size:0.94rem;color:var(--muted);line-height:1.6;margin:0}
.ng-timeline .track-wrap{overflow-x:auto;padding:4px 2px 8px}
.ng-timeline .track{position:relative;min-width:700px;padding-top:8px}
.ng-timeline .line{position:absolute;top:16px;height:2px;background:var(--line)}
.ng-timeline .dots{position:relative;display:grid}
.ng-timeline .stop{display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;background:none;border:none;padding:0 4px;font-family:inherit}
.ng-timeline .dot{width:16px;height:16px;border-radius:50%;border:3px solid var(--btn-bg);box-shadow:0 0 0 1px var(--line);transition:transform .15s ease;flex-shrink:0}
.ng-timeline .stop.active .dot{transform:scale(1.3)}
.ng-timeline .date{font-size:0.72rem;color:var(--muted);white-space:nowrap;font-variant-numeric:tabular-nums}
.ng-timeline .title{font-size:0.78rem;color:var(--fg);text-align:center;line-height:1.3}
.ng-timeline .stop.active .title{color:var(--fg-strong);font-weight:600}
.ng-timeline .detail{border:1px solid var(--line);border-radius:10px;padding:16px 18px;background:var(--code-bg)}
.ng-timeline .detail h4{margin:0 0 4px;font-size:1.05rem;color:var(--fg-strong)}
.ng-timeline .detail .when{font-size:0.82rem;color:var(--muted);margin-bottom:10px;font-variant-numeric:tabular-nums}
.ng-timeline .detail ul{margin:0;padding-left:1.1rem;display:flex;flex-direction:column;gap:6px;font-size:0.92rem}
`;

export default function VersionTimeline() {
  const [active, setActive] = useState(0);
  const event = TIMELINE[active];
  const color =
    event.version === "now" ? "var(--fg-strong)" : VERSION_COLOR[event.version];
  const n = TIMELINE.length;
  const inset = 50 / n;

  return (
    <div className="demo ng-timeline">
      <style>{CSS}</style>
      <p className="caption">
        Click a point to see what shipped, or what changed later on that line.
      </p>
      <div className="track-wrap">
        <div className="track">
          <div
            className="line"
            style={{ left: `${inset}%`, right: `${inset}%` }}
          />
          <div
            className="dots"
            style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
          >
            {TIMELINE.map((ev, i) => {
              const dotColor =
                ev.version === "now"
                  ? "var(--fg-strong)"
                  : VERSION_COLOR[ev.version];
              return (
                <button
                  type="button"
                  key={ev.date + ev.title}
                  className={`stop${i === active ? " active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <span className="dot" style={{ background: dotColor }} />
                  <span className="date">{ev.date}</span>
                  <span className="title">{ev.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="detail" style={{ borderLeft: `4px solid ${color}` }}>
        <h4>{event.title}</h4>
        <div className="when">{event.date}</div>
        <ul>
          {event.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
