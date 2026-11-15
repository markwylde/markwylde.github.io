import { BASE_CSS, C } from "./bits";

const RECUR = [
  { k: "Ticked tasks that weren't done", n: 14 },
  { k: "Forgot cache invalidation for new data", n: 13 },
  { k: "Permission check on the main path only", n: 12 },
  { k: "Permission logic outside `can()`", n: 5 },
];

const SELF = [
  {
    k: "Test and check commands",
    total: 3874,
    bad: 1135,
    note: "failed, every one worked back to green",
  },
  { k: "Tool calls", total: 26736, bad: 154, note: "errored" },
];

const CSS = `
.bl-ds{display:grid;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr));gap:24px 32px}
.bl-ds h5{padding-bottom:12px;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}
.bl-ds .row{padding-bottom:12px;font-size:.84rem}
.bl-ds .dots{display:grid;grid-template-columns:repeat(26,1fr);gap:2px;margin-top:4px;max-width:22rem}
.bl-ds .dots i{aspect-ratio:1;border-radius:2px;background:var(--track)}
.bl-ds .dots i.on{background:${C.bad}}
.bl-ds .row b{color:var(--fg-strong)}
.bl-ds .sb{height:14px;border-radius:3px;background:${C.good};overflow:hidden;margin-top:4px;display:flex}
.bl-ds .sb span{background:${C.p2};height:100%}
.bl-ds small{color:var(--muted);font-size:.74rem}
.bl-ds .big{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:8px}
.bl-ds .big small{display:block;line-height:1.35}
.bl-ds .big b{display:block;font-size:1.3rem;color:${C.good}}
`;

export default function DeepSeekScore() {
  return (
    <div className="demo bl-x bl-ds">
      <style>{BASE_CSS + CSS}</style>
      <div>
        <h5 style={{ color: C.bad }}>
          Kept coming back · changes affected, of 26
        </h5>
        {RECUR.map((r) => (
          <div className="row" key={r.k}>
            {r.k
              .split("`")
              .map((p, i) => (i % 2 ? <code key={p}>{p}</code> : p))}{" "}
            <b>{r.n}</b>
            <div className="dots">
              {Array.from({ length: 26 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed grid
                <i key={i} className={i < r.n ? "on" : ""} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h5 style={{ color: C.good }}>Caught and fixed itself</h5>
        {SELF.map((s) => (
          <div className="row" key={s.k}>
            {s.k}: <b>{s.total.toLocaleString()}</b>
            <div className="sb">
              <span style={{ width: `${(s.bad / s.total) * 100}%` }} />
            </div>
            <small>
              {s.bad.toLocaleString()} ({((s.bad / s.total) * 100).toFixed(1)}%){" "}
              {s.note}
            </small>
          </div>
        ))}
        <div className="big">
          <div>
            <b>243</b>
            <small>TypeScript errors hit and fixed</small>
          </div>
          <div>
            <b>17 / 20</b>
            <small>
              changes passed <code>bun run check</code> first time
            </small>
          </div>
          <div>
            <b>0</b>
            <small>invented blockers</small>
          </div>
        </div>
      </div>
    </div>
  );
}
