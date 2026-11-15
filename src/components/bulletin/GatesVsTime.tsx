import { useState } from "react";
import { BASE_CSS, C } from "./bits";
import { CHANGES } from "./changes";

const PTS = CHANGES.filter((c) => c.name !== "dev-stack-isolation");
type Axis = "gates" | "lines";

function corr(xs: number[], ys: number[]) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}

const W = 640;
const H = 300;
const PAD = { l: 44, r: 16, t: 14, b: 40 };
const LABEL = new Set([
  "moderation",
  "plugin-platform",
  "public-api-webhooks",
  "pwa-push",
  "i18n-foundation",
  "content-pipeline",
  "rendering-and-caching",
]);

const CSS = `
.bl-gt{display:flex;flex-direction:column;gap:10px}
.bl-gt .tabs{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:.8rem;color:var(--muted)}
.bl-gt .tabs button{font:inherit;font-size:.8rem;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);cursor:pointer}
.bl-gt .tabs button.on{border-color:var(--fg-strong);color:var(--fg-strong);font-weight:600}
.bl-gt svg{width:100%;height:auto;display:block}
.bl-gt text{fill:var(--muted);font-size:11px;font-family:inherit}
.bl-gt .r{font-size:.82rem}
.bl-gt .r b{color:var(--fg-strong)}
`;

export default function GatesVsTime() {
  const [axis, setAxis] = useState<Axis>("gates");
  const [hover, setHover] = useState<string | null>(null);
  const xv = (c: (typeof PTS)[number]) =>
    axis === "gates" ? c.gates : c.added / 1000;
  const xs = PTS.map(xv);
  const ys = PTS.map((c) => c.minutes / 60);
  const xmax = axis === "gates" ? 9 : 32;
  const ymax = 14;
  const sx = (v: number) => PAD.l + (v / xmax) * (W - PAD.l - PAD.r);
  const sy = (v: number) => H - PAD.b - (v / ymax) * (H - PAD.t - PAD.b);
  const r = corr(xs, ys);
  const xt =
    axis === "gates"
      ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      : [0, 5, 10, 15, 20, 25, 30];
  const h = PTS.find((c) => c.name === hover);

  return (
    <div className="demo bl-x bl-gt">
      <style>{BASE_CSS + CSS}</style>
      <div className="tabs">
        Hours per change against:
        <button
          type="button"
          className={axis === "gates" ? "on" : ""}
          onClick={() => setAxis("gates")}
        >
          Final gates
        </button>
        <button
          type="button"
          className={axis === "lines" ? "on" : ""}
          onClick={() => setAxis("lines")}
        >
          Lines added
        </button>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Scatter plot of hours per change"
      >
        {[0, 2, 4, 6, 8, 10, 12, 14].map((y) => (
          <g key={y}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={sy(y)}
              y2={sy(y)}
              stroke="var(--grid)"
            />
            <text x={PAD.l - 8} y={sy(y) + 4} textAnchor="end">
              {y}h
            </text>
          </g>
        ))}
        {xt.map((x) => (
          <text key={x} x={sx(x)} y={H - PAD.b + 16} textAnchor="middle">
            {axis === "gates" ? x : `${x}k`}
          </text>
        ))}
        <text x={(W + PAD.l) / 2} y={H - 4} textAnchor="middle">
          {axis === "gates"
            ? "final gates (full stack + all suites + Codex sign-off)"
            : "lines added"}
        </text>
        {PTS.map((c, i) => {
          const sub = c.name === "operations-observability";
          const hi = c.name === hover;
          return (
            <g key={c.name}>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: hover detail; the same numbers are in the change timeline */}
              <circle
                cx={sx(xs[i])}
                cy={sy(ys[i])}
                r={hi ? 8 : 6}
                fill={sub ? C.claude : c.gates >= 5 ? C.p1 : C.deepseek}
                fillOpacity={0.85}
                stroke="var(--btn-bg)"
                strokeWidth={1.5}
                style={{ cursor: "pointer", transition: "cx .4s, cy .4s" }}
                onMouseEnter={() => setHover(c.name)}
                onClick={() => setHover(c.name)}
              />
              {LABEL.has(c.name) && (
                <text
                  x={sx(xs[i]) + (xs[i] > xmax * 0.75 ? -10 : 10)}
                  y={sy(ys[i]) + 4}
                  textAnchor={xs[i] > xmax * 0.75 ? "end" : "start"}
                  style={{ transition: "x .4s, y .4s" }}
                >
                  {c.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="r">
        {h ? (
          <>
            <b>{h.name}</b>: {Math.floor(h.minutes / 60)}h
            {String(h.minutes % 60).padStart(2, "0")}m, {h.gates} final gate
            {h.gates === 1 ? "" : "s"}, {h.steers} steer
            {h.steers === 1 ? "" : "s"}, +{h.added.toLocaleString()} lines.
          </>
        ) : (
          <>
            Correlation with hours: <b>r = {r.toFixed(2)}</b>. Red dots needed
            five or more final gates; orange was built by Claude subagents.
          </>
        )}
      </div>
    </div>
  );
}
