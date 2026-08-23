import { useMemo, useState } from "react";
import {
  MIGRATION_22_TO_24,
  MIGRATION_24_TO_26,
  type MigrationStep,
  VERSION_COLOR,
} from "./data";

const CSS = `
.ng-migration{display:flex;flex-direction:column;gap:16px;padding:18px}
.ng-migration .caption{font-size:1rem;color:var(--muted);line-height:1.6;margin:0}
.ng-migration .pickers{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.ng-migration select{padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg-strong);font-family:inherit;font-size:0.92rem;font-weight:600}
.ng-migration .arrow{color:var(--muted);font-size:1.1rem}
.ng-migration .progress-wrap{display:flex;align-items:center;gap:10px}
.ng-migration .progress-track{flex:1;height:10px;border-radius:6px;background:var(--track);overflow:hidden}
.ng-migration .progress-fill{height:100%;border-radius:6px;transition:width .25s ease}
.ng-migration .progress-label{font-size:0.82rem;color:var(--muted);white-space:nowrap;font-variant-numeric:tabular-nums}
.ng-migration .steps{display:flex;flex-direction:column;gap:8px}
.ng-migration .step{display:flex;gap:12px;border:1px solid var(--line);border-radius:10px;padding:12px 14px;background:var(--btn-bg)}
.ng-migration .step.done{opacity:0.6}
.ng-migration .step input{margin-top:3px;width:16px;height:16px;accent-color:#6f7bff;flex-shrink:0}
.ng-migration .step-body{display:flex;flex-direction:column;gap:4px;min-width:0}
.ng-migration .step-title{font-size:0.94rem;font-weight:600;color:var(--fg-strong)}
.ng-migration .step.done .step-title{text-decoration:line-through}
.ng-migration .step-detail{font-size:0.88rem;color:var(--muted);line-height:1.5}
.ng-migration .step code.block{display:block;white-space:pre;font-family:ui-monospace,Menlo,monospace;background:var(--code-bg);color:var(--code-fg);padding:8px 10px;border-radius:6px;margin-top:6px;overflow-x:auto;font-size:0.82rem}
.ng-migration .hop-label{font-size:0.78rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--muted);margin-top:6px}
`;

type V = 22 | 24 | 26;
const FROM_OPTIONS: V[] = [22, 24];

export default function MigrationChecklist() {
  const [from, setFrom] = useState<V>(22);
  const [to, setTo] = useState<V>(26);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toOptions: V[] = from === 22 ? [24, 26] : [26];

  function onFromChange(v: V) {
    setFrom(v);
    if (v === 24 && to === 24) setTo(26);
  }

  const groups = useMemo(() => {
    const out: { label: string; color: string; steps: MigrationStep[] }[] = [];
    if (from === 22) {
      out.push({
        label: "22 \u2192 24",
        color: VERSION_COLOR[24],
        steps: MIGRATION_22_TO_24,
      });
    }
    if (to === 26) {
      out.push({
        label: "24 \u2192 26",
        color: VERSION_COLOR[26],
        steps: MIGRATION_24_TO_26,
      });
    }
    return out;
  }, [from, to]);

  const allSteps = useMemo(() => groups.flatMap((g) => g.steps), [groups]);
  const doneCount = allSteps.filter((s) => checked.has(s.id)).length;
  const pct = allSteps.length
    ? Math.round((doneCount / allSteps.length) * 100)
    : 0;

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="demo ng-migration">
      <style>{CSS}</style>
      <p className="caption">
        Pick where you're starting from and where you're headed, then check
        items off as you go. Nothing here is saved, it's just for this read.
      </p>
      <div className="pickers">
        <select
          value={from}
          onChange={(e) => onFromChange(Number(e.target.value) as V)}
        >
          {FROM_OPTIONS.map((v) => (
            <option key={v} value={v}>
              From Node {v}
            </option>
          ))}
        </select>
        <span className="arrow">→</span>
        <select value={to} onChange={(e) => setTo(Number(e.target.value) as V)}>
          {toOptions.map((v) => (
            <option key={v} value={v}>
              To Node {v}
            </option>
          ))}
        </select>
      </div>

      <div className="progress-wrap">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, background: VERSION_COLOR[to] }}
          />
        </div>
        <span className="progress-label">
          {doneCount}/{allSteps.length} done
        </span>
      </div>

      {groups.map((g) => (
        <div key={g.label}>
          {groups.length > 1 && (
            <div className="hop-label" style={{ color: g.color }}>
              {g.label}
            </div>
          )}
          <div className="steps">
            {g.steps.map((s) => {
              const done = checked.has(s.id);
              return (
                <label className={`step${done ? " done" : ""}`} key={s.id}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggle(s.id)}
                  />
                  <span className="step-body">
                    <span className="step-title">{s.title}</span>
                    <span className="step-detail">{s.detail}</span>
                    {s.code && <code className="block">{s.code}</code>}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
