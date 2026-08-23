import { useMemo, useState } from "react";
import {
  type NodeVersion,
  PRIORITIES,
  VERSION_COLOR,
  VERSION_LABEL,
  VERSION_STATUS,
} from "./data";

const CSS = `
.ng-rec{display:flex;flex-direction:column;gap:18px;padding:18px}
.ng-rec .caption{font-size:1rem;color:var(--muted);line-height:1.6;margin:0}
.ng-rec .chips{display:flex;flex-wrap:wrap;gap:8px}
.ng-rec .chip{border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);border-radius:999px;padding:8px 14px;font-size:0.88rem;cursor:pointer;transition:all .15s ease;line-height:1.3;text-align:left}
.ng-rec .chip:hover{border-color:#6f7bff}
.ng-rec .chip.active{background:#6f7bff;border-color:#6f7bff;color:#fff}
.ng-rec .results{display:flex;flex-direction:column;gap:10px}
.ng-rec .bar-row{display:grid;grid-template-columns:150px 1fr;gap:12px;align-items:center}
.ng-rec .bar-label{font-size:0.92rem;font-weight:600;color:var(--fg-strong);display:flex;flex-direction:column}
.ng-rec .bar-label small{font-weight:400;color:var(--muted);font-size:0.76rem}
.ng-rec .bar-track{position:relative;height:26px;border-radius:8px;background:var(--track);overflow:hidden}
.ng-rec .bar-fill{position:absolute;inset:0 auto 0 0;border-radius:8px;transition:width .3s ease}
.ng-rec .winner{border:1px solid var(--line);border-radius:10px;padding:16px;background:var(--code-bg)}
.ng-rec .winner h4{margin:0 0 8px;font-size:1.05rem;color:var(--fg-strong)}
.ng-rec .winner ul{margin:0;padding-left:1.1rem;display:flex;flex-direction:column;gap:5px;font-size:0.92rem}
.ng-rec .hint{font-size:0.85rem;color:var(--muted);margin:0}
`;

const NEUTRAL_ORDER: NodeVersion[] = [24, 26, 22];

export default function RecommenderTool() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const scores = useMemo(() => {
    const base: Record<NodeVersion, number> = { 22: 0, 24: 0, 26: 0 };
    for (const p of PRIORITIES) {
      if (!selected.has(p.id)) continue;
      base[22] += p.weight[22];
      base[24] += p.weight[24];
      base[26] += p.weight[26];
    }
    return base;
  }, [selected]);

  const ranked = useMemo(() => {
    const versions: NodeVersion[] = [22, 24, 26];
    if (selected.size === 0) return NEUTRAL_ORDER;
    return [...versions].sort((a, b) => scores[b] - scores[a]);
  }, [scores, selected.size]);

  const max = Math.max(
    1,
    ...([22, 24, 26] as NodeVersion[]).map((v) => Math.abs(scores[v])),
  );
  const top = ranked[0];

  const reasons = useMemo(() => {
    const out: string[] = [];
    for (const p of PRIORITIES) {
      if (!selected.has(p.id)) continue;
      const r = p.reason[top];
      if (r) out.push(r);
    }
    return out;
  }, [selected, top]);

  return (
    <div className="demo ng-rec">
      <style>{CSS}</style>
      <p className="caption">
        Tick whatever matters to you. The ranking below updates live, weighted
        by the trade-offs above.
      </p>
      <div className="chips">
        {PRIORITIES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`chip${selected.has(p.id) ? " active" : ""}`}
            onClick={() => toggle(p.id)}
            aria-pressed={selected.has(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="results">
        {ranked.map((v) => {
          const score = scores[v];
          const width =
            selected.size === 0
              ? 33
              : Math.max(6, (Math.abs(score) / max) * 100);
          return (
            <div className="bar-row" key={v}>
              <span className="bar-label">
                {VERSION_LABEL[v]}
                <small>{VERSION_STATUS[v]}</small>
              </span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${width}%`,
                    background: VERSION_COLOR[v],
                    opacity: selected.size === 0 ? 0.35 : score < 0 ? 0.35 : 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {selected.size > 0 ? (
        <div
          className="winner"
          style={{ borderLeft: `4px solid ${VERSION_COLOR[top]}` }}
        >
          <h4>Best fit: {VERSION_LABEL[top]}</h4>
          {reasons.length > 0 ? (
            <ul>
              {reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className="hint">
              None of your picks favour this line specifically. It wins by
              having the fewest downsides.
            </p>
          )}
        </div>
      ) : (
        <p className="hint">
          No priorities selected yet. Showing the default order: 24, then 26,
          then 22.
        </p>
      )}
    </div>
  );
}
