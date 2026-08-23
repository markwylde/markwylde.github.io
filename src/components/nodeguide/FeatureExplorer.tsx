import { useMemo, useState } from "react";
import { CATEGORIES, FEATURES, type Support, VERSION_COLOR } from "./data";

const CSS = `
.ng-explorer{display:flex;flex-direction:column;gap:16px;padding:18px}
.ng-explorer .caption{font-size:1rem;color:var(--muted);line-height:1.6;margin:0}
.ng-explorer .controls{display:flex;flex-direction:column;gap:10px}
.ng-explorer .search{width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);font-family:inherit;font-size:0.92rem}
.ng-explorer .chips{display:flex;flex-wrap:wrap;gap:8px}
.ng-explorer .chip{border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);border-radius:999px;padding:6px 12px;font-size:0.82rem;cursor:pointer;transition:all .15s ease}
.ng-explorer .chip:hover{border-color:#6f7bff}
.ng-explorer .chip.active{background:#6f7bff;border-color:#6f7bff;color:#fff}
.ng-explorer .count{font-size:0.82rem;color:var(--muted)}
.ng-explorer .rows{display:flex;flex-direction:column;gap:6px}
.ng-explorer .row{border:1px solid var(--line);border-radius:10px;overflow:hidden}
.ng-explorer .row-head{display:grid;width:100%;grid-template-columns:1fr auto;align-items:center;gap:10px;padding:11px 14px;cursor:pointer;background:var(--btn-bg);border:none;font-family:inherit;color:inherit;text-align:left}
.ng-explorer .row-head:hover{background:var(--code-bg)}
.ng-explorer .row-name{display:flex;flex-direction:column;gap:2px;min-width:0}
.ng-explorer .row-name strong{font-size:0.94rem;color:var(--fg-strong);line-height:1.3}
.ng-explorer .row-name span{font-size:0.76rem;color:var(--muted)}
.ng-explorer .pills{display:flex;gap:6px;flex-shrink:0}
.ng-explorer .pill{width:34px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;color:#fff}
.ng-explorer .pill.no{background:var(--track);color:var(--muted)}
.ng-explorer .row-body{padding:0 14px 14px;font-size:0.9rem;line-height:1.6;color:var(--fg)}
.ng-explorer .row-body .status-lines{display:flex;flex-direction:column;gap:4px;margin:8px 0;font-size:0.85rem;color:var(--muted)}
.ng-explorer .row-body code.block{display:block;white-space:pre;font-family:ui-monospace,Menlo,monospace;background:var(--code-bg);color:var(--code-fg);padding:10px 12px;border-radius:6px;margin-top:10px;overflow-x:auto}
.ng-explorer .empty{font-size:0.9rem;color:var(--muted);padding:20px;text-align:center;border:1px dashed var(--line);border-radius:10px}
`;

const SUPPORT_LABEL: Record<Support, string> = {
  yes: "\u2713",
  partial: "~",
  no: "\u2014",
};

export default function FeatureExplorer() {
  const [activeCats, setActiveCats] = useState<Set<string>>(
    new Set(CATEGORIES),
  );
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggleCat(cat: string) {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FEATURES.filter((f) => {
      if (!activeCats.has(f.category)) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.detail.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }, [activeCats, query]);

  return (
    <div className="demo ng-explorer">
      <style>{CSS}</style>
      <p className="caption">
        Filter by category or search, then click any row to see the exact
        version it changed and why it matters.
      </p>
      <div className="controls">
        <input
          className="search"
          type="text"
          placeholder="Search features… e.g. TypeScript, Corepack, Temporal"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          <button
            type="button"
            className={`chip${activeCats.size === CATEGORIES.length ? " active" : ""}`}
            onClick={() => setActiveCats(new Set(CATEGORIES))}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip${activeCats.has(cat) ? " active" : ""}`}
              onClick={() => toggleCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="count">
          {filtered.length} of {FEATURES.length} capabilities
        </span>
      </div>

      <div className="rows">
        {filtered.length === 0 && (
          <div className="empty">
            Nothing matches that filter. Try clearing the search or picking
            "All".
          </div>
        )}
        {filtered.map((f) => {
          const isOpen = expanded === f.id;
          return (
            <div className="row" key={f.id}>
              <button
                type="button"
                className="row-head"
                onClick={() => setExpanded(isOpen ? null : f.id)}
                aria-expanded={isOpen}
              >
                <span className="row-name">
                  <strong>{f.name}</strong>
                  <span>{f.category}</span>
                </span>
                <span className="pills">
                  {([22, 24, 26] as const).map((v) => {
                    const s = f.status[v];
                    return (
                      <span
                        key={v}
                        className={`pill${s.support === "no" ? " no" : ""}`}
                        style={
                          s.support !== "no"
                            ? {
                                background: VERSION_COLOR[v],
                                opacity: s.support === "partial" ? 0.55 : 1,
                              }
                            : undefined
                        }
                        title={`Node ${v}: ${s.note}`}
                      >
                        {SUPPORT_LABEL[s.support]}
                      </span>
                    );
                  })}
                </span>
              </button>
              {isOpen && (
                <div className="row-body">
                  <div>{f.detail}</div>
                  <div className="status-lines">
                    {([22, 24, 26] as const).map((v) => (
                      <div key={v}>
                        <strong style={{ color: VERSION_COLOR[v] }}>
                          Node {v}:
                        </strong>{" "}
                        {f.status[v].note}
                      </div>
                    ))}
                  </div>
                  {f.code && <code className="block">{f.code}</code>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
