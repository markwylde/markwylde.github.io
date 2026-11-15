import { useMemo, useState } from "react";
import { BASE_CSS } from "./bits";
import { CATEGORIES, FINDINGS } from "./findings";

const CSS = `
.bl-fe{display:flex;flex-direction:column;gap:14px}
.bl-fe .cats{display:flex;flex-direction:column;gap:3px}
.bl-fe .cat{display:grid;grid-template-columns:minmax(0,15rem) 1fr 2.6rem;gap:10px;align-items:center;background:none;border:none;padding:3px 4px;border-radius:6px;font:inherit;color:var(--fg);cursor:pointer;text-align:left;font-size:.8rem}
.bl-fe .cat:hover,.bl-fe .cat.active{background:var(--pad-fill)}
.bl-fe .cat.active .name{color:var(--fg-strong);font-weight:600}
.bl-fe .cat .name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-fe .cat .bar{display:flex;height:12px;background:var(--track);border-radius:3px;overflow:hidden}
.bl-fe .cat .bar span{height:100%}
.bl-fe .cat .n{text-align:right;font-variant-numeric:tabular-nums;color:var(--muted)}
.bl-fe .legend{display:flex;gap:14px;font-size:.76rem;color:var(--muted);flex-wrap:wrap}
.bl-fe .sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.bl-fe .filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.bl-fe select,.bl-fe input[type=search]{font:inherit;font-size:.82rem;padding:5px 8px;border-radius:8px;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);max-width:100%}
.bl-fe input[type=search]{flex:1;min-width:10rem}
.bl-fe .filters label{font-size:.8rem;display:flex;gap:5px;align-items:center}
.bl-fe .count{font-size:.8rem;color:var(--muted)}
.bl-fe ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;max-height:28rem;overflow:auto}
.bl-fe li{border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--btn-bg);font-size:.84rem;line-height:1.45}
.bl-fe li .meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;font-size:.72rem;color:var(--muted)}
.bl-fe li code{font-size:.72rem;color:var(--code-fg);word-break:break-all}
.bl-fe .tag{padding:1px 6px;border-radius:999px;border:1px solid var(--line)}
.bl-fe .tag.p1{border-color:#d9485f;color:#d9485f}
.bl-fe .tag.sec{border-color:#c46b00;color:#c46b00}
.bl-fe .tag.fix{border-color:#8a6cf0;color:#8a6cf0}
`;

const P1C = "#d9485f";
const P2C = "#f0a04f";

export default function FindingsExplorer() {
  const [cat, setCat] = useState<string>("visibility-leak");
  const [change, setChange] = useState("all");
  const [p1Only, setP1Only] = useState(false);
  const [secOnly, setSecOnly] = useState(false);
  const [fixOnly, setFixOnly] = useState(false);
  const [q, setQ] = useState("");
  const max = Math.max(...CATEGORIES.map((c) => c.raw));
  const changes = useMemo(() => [...new Set(FINDINGS.map((f) => f[0]))], []);

  const list = FINDINGS.filter(
    (f) =>
      (cat === "all" || f[3] === cat) &&
      (change === "all" || f[0] === change) &&
      (!p1Only || f[1] === "P1") &&
      (!secOnly || f[2] === 1) &&
      (!fixOnly || f[7] === 1) &&
      (q === "" || `${f[4]} ${f[5]}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="demo bl-x bl-fe">
      <style>{BASE_CSS + CSS}</style>
      <div className="legend">
        <span>
          <i className="sw" style={{ background: P1C }} />
          P1
        </span>
        <span>
          <i className="sw" style={{ background: P2C }} />
          P2
        </span>
        <span>Click a category to list its findings.</span>
      </div>
      <div className="cats">
        <button
          type="button"
          className={`cat${cat === "all" ? " active" : ""}`}
          onClick={() => setCat("all")}
        >
          <span className="name">All categories</span>
          <span />
          <span className="n">{FINDINGS.length}</span>
        </button>
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c.category}
            className={`cat${cat === c.category ? " active" : ""}`}
            onClick={() => setCat(c.category)}
            title={c.label}
          >
            <span className="name">{c.label}</span>
            <span className="bar">
              <span
                style={{ width: `${(c.P1 / max) * 100}%`, background: P1C }}
              />
              <span
                style={{
                  width: `${((c.raw - c.P1) / max) * 100}%`,
                  background: P2C,
                }}
              />
            </span>
            <span className="n">{c.raw}</span>
          </button>
        ))}
      </div>
      <div className="filters">
        <input
          type="search"
          placeholder="Search titles and files…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={change} onChange={(e) => setChange(e.target.value)}>
          <option value="all">All changes</option>
          {changes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={p1Only}
            onChange={(e) => setP1Only(e.target.checked)}
          />
          P1 only
        </label>
        <label>
          <input
            type="checkbox"
            checked={secOnly}
            onChange={(e) => setSecOnly(e.target.checked)}
          />
          [security] only
        </label>
        <label>
          <input
            type="checkbox"
            checked={fixOnly}
            onChange={(e) => setFixOnly(e.target.checked)}
          />
          On a line written by a fix
        </label>
      </div>
      <span className="count">
        {list.length} finding{list.length === 1 ? "" : "s"}
      </span>
      <ul>
        {list.slice(0, 200).map((f, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list
          <li key={i}>
            {f[4]}
            <div className="meta">
              <span className={`tag${f[1] === "P1" ? " p1" : ""}`}>{f[1]}</span>
              {f[2] === 1 && <span className="tag sec">security</span>}
              {f[7] === 1 && (
                <span className="tag fix">line from a fix commit</span>
              )}
              {f[6] === 1 && <span className="tag">raised again</span>}
              <span>{f[0]}</span>
              {f[5] && <code>{f[5]}</code>}
            </div>
          </li>
        ))}
      </ul>
      {list.length > 200 && (
        <span className="count">
          Showing the first 200. Narrow the filters to see the rest.
        </span>
      )}
    </div>
  );
}
