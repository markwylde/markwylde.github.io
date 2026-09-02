import { useMemo, useState } from "react";
import {
  FATE_BLURB,
  FATE_COLOR,
  FATE_LABEL,
  type Fate,
  FRAMEWORKS,
  type TreeNode,
} from "./data";

const CSS = `
.sf-tree{display:flex;flex-direction:column;gap:14px;padding:18px}
.sf-tree .tabs{display:flex;flex-wrap:wrap;gap:8px}
.sf-tree .tab{border:1px solid var(--line);background:var(--btn-bg);color:var(--fg);border-radius:999px;padding:7px 14px;font-size:0.85rem;font-family:inherit;font-weight:600;cursor:pointer;transition:all .15s ease}
.sf-tree .tab:hover{border-color:#6f7bff}
.sf-tree .tab.active{background:#6f7bff;border-color:#6f7bff;color:#fff}
.sf-tree .lead{margin:0;font-size:0.92rem;line-height:1.6;color:var(--muted)}
.sf-tree .lead strong{color:var(--fg-strong)}
.sf-tree .bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px}
.sf-tree .legend{display:flex;flex-wrap:wrap;gap:6px}
.sf-tree .key{display:inline-flex;align-items:center;gap:6px;font-size:0.76rem;color:var(--muted);border:1px solid var(--line);background:var(--btn-bg);border-radius:999px;padding:4px 10px;cursor:pointer;font-family:inherit}
.sf-tree .key:hover{border-color:#6f7bff;color:var(--fg)}
.sf-tree .key.on{border-color:#6f7bff;color:var(--fg-strong)}
.sf-tree .swatch{width:9px;height:9px;border-radius:3px;flex-shrink:0}
.sf-tree .survive{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:0.78rem;color:var(--muted);cursor:pointer;user-select:none}
.sf-tree .survive input{accent-color:#2f9e6e;cursor:pointer}
.sf-tree .split{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:14px;align-items:start}
.sf-tree .pane{border:1px solid var(--line);border-radius:10px;background:var(--btn-bg);overflow:hidden}
.sf-tree .files{padding:10px 8px;font-family:ui-monospace,Menlo,monospace;font-size:0.82rem;line-height:1.5;overflow-x:auto}
.sf-tree .node{display:flex;align-items:baseline;gap:6px;width:100%;text-align:left;border:none;background:none;font-family:inherit;font-size:inherit;color:var(--fg);padding:3px 8px;border-radius:6px;cursor:pointer;transition:background .12s ease,opacity .18s ease}
.sf-tree .node:hover{background:var(--code-bg)}
.sf-tree .node.sel{background:rgba(111,123,255,0.16);color:var(--fg-strong)}
.sf-tree .node.dim{opacity:0.26}
.sf-tree .caret{width:10px;flex-shrink:0;color:var(--muted);transition:transform .15s ease;display:inline-block}
.sf-tree .caret.open{transform:rotate(90deg)}
.sf-tree .dot{width:8px;height:8px;border-radius:3px;flex-shrink:0;align-self:center}
.sf-tree .nm{white-space:nowrap}
.sf-tree .node.isdir .nm{font-weight:600;color:var(--fg-strong)}
.sf-tree .node.dim .nm{font-weight:400}
.sf-tree .hint{margin-left:6px;font-size:0.74rem;color:var(--muted);font-family:'Montserrat',ui-sans-serif,system-ui,sans-serif;white-space:nowrap}
.sf-tree .detail{padding:16px;display:flex;flex-direction:column;gap:10px;position:sticky;top:16px}
.sf-tree .detail .path{font-family:ui-monospace,Menlo,monospace;font-size:0.86rem;color:var(--fg-strong);word-break:break-all;margin:0}
.sf-tree .badge{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;font-size:0.72rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;border-radius:999px;padding:4px 10px;color:#fff}
.sf-tree .detail p{margin:0;font-size:0.9rem;line-height:1.65;color:var(--fg)}
.sf-tree .detail .fate-blurb{font-size:0.8rem;color:var(--muted)}
.sf-tree .detail pre{margin:4px 0 0;background:var(--code-bg);color:var(--fg);padding:12px 14px;border-radius:8px;overflow-x:auto;font-family:ui-monospace,Menlo,monospace;font-size:0.76rem;line-height:1.55;white-space:pre}
.sf-tree .detail .ex-label{font-size:0.72rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted);font-weight:700}
.sf-tree .empty{padding:28px 18px;text-align:center;font-size:0.86rem;color:var(--muted);line-height:1.6}
.sf-tree .verdict{margin:0;font-size:0.88rem;line-height:1.65;color:var(--fg);border-left:3px solid #6f7bff;padding-left:12px}
.sf-tree .facts{display:flex;flex-wrap:wrap;gap:8px}
.sf-tree .fact{font-size:0.76rem;color:var(--muted);border:1px solid var(--line);border-radius:8px;padding:6px 10px;background:var(--btn-bg)}
.sf-tree .fact b{color:var(--fg-strong);font-weight:600}
@media (max-width:820px){
  .sf-tree{padding:14px}
  .sf-tree .split{grid-template-columns:1fr}
  .sf-tree .detail{position:static}
  .sf-tree .survive{margin-left:0}
}
`;

interface Row {
  node: TreeNode;
  depth: number;
  path: string;
  hasKids: boolean;
  isOpen: boolean;
}

/** Flatten the tree into visible rows, honouring the open/closed set. */
function flatten(
  node: TreeNode,
  depth: number,
  parentPath: string,
  closed: Set<string>,
  opened: Set<string>,
  out: Row[],
) {
  const path = parentPath ? `${parentPath}${node.name}` : node.name;
  const kids = node.children ?? [];
  const defaultOpen = node.open ?? false;
  const isOpen = opened.has(path) || (defaultOpen && !closed.has(path));
  out.push({ node, depth, path, hasKids: kids.length > 0, isOpen });
  if (isOpen) {
    for (const kid of kids) flatten(kid, depth + 1, path, closed, opened, out);
  }
  return out;
}

/** Every path in the tree, so the survivors toggle can reveal buried ones. */
function allPaths(node: TreeNode, parentPath: string, out: Set<string>) {
  const path = parentPath ? `${parentPath}${node.name}` : node.name;
  out.add(path);
  for (const kid of node.children ?? []) allPaths(kid, path, out);
  return out;
}

export default function TreeExplorer() {
  const [fw, setFw] = useState(0);
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [survivorsOnly, setSurvivorsOnly] = useState(false);
  const [hoverFate, setHoverFate] = useState<Fate | null>(null);

  const framework = FRAMEWORKS[fw];

  const rows = useMemo(
    () => flatten(framework.tree, 0, "", closed, opened, []),
    [framework, closed, opened],
  );

  const current = rows.find((r) => r.path === selected)?.node ?? null;
  const currentPath = selected;

  function pickFramework(i: number) {
    setFw(i);
    setSelected(null);
    setClosed(new Set());
    setOpened(
      survivorsOnly ? allPaths(FRAMEWORKS[i].tree, "", new Set()) : new Set(),
    );
  }

  function toggle(row: Row) {
    if (!row.hasKids) return;
    const nextOpened = new Set(opened);
    const nextClosed = new Set(closed);
    if (row.isOpen) {
      nextOpened.delete(row.path);
      nextClosed.add(row.path);
    } else {
      nextClosed.delete(row.path);
      nextOpened.add(row.path);
    }
    setOpened(nextOpened);
    setClosed(nextClosed);
  }

  function onNode(row: Row) {
    toggle(row);
    setSelected(row.path);
  }

  function dimmed(node: TreeNode) {
    if (hoverFate) return node.fate !== hoverFate;
    if (survivorsOnly) return node.fate !== "durable";
    return false;
  }

  // A survivor buried in a collapsed folder would read as "not there at all",
  // so turning the filter on opens the whole tree.
  function toggleSurvivors(on: boolean) {
    setSurvivorsOnly(on);
    if (on) {
      setOpened(allPaths(framework.tree, "", new Set()));
      setClosed(new Set());
    }
  }

  const fates: Fate[] = ["durable", "frozen", "scratch", "tooling", "code"];

  return (
    <div className="demo sf-tree">
      <style>{CSS}</style>

      <div className="tabs">
        {FRAMEWORKS.map((f, i) => (
          <button
            type="button"
            key={f.id}
            className={`tab${i === fw ? " active" : ""}`}
            onClick={() => pickFramework(i)}
          >
            {f.name}
          </button>
        ))}
      </div>

      <p className="lead">{framework.tagline}</p>

      <div className="facts">
        <span className="fact">
          <b>Unit of work:</b> {framework.unit}
        </span>
        <span className="fact">
          <b>Survives the implementation:</b> {framework.survives}
        </span>
      </div>

      <div className="bar">
        <div className="legend">
          {fates.map((f) => (
            <button
              type="button"
              key={f}
              className={`key${hoverFate === f ? " on" : ""}`}
              onMouseEnter={() => setHoverFate(f)}
              onMouseLeave={() => setHoverFate(null)}
              onFocus={() => setHoverFate(f)}
              onBlur={() => setHoverFate(null)}
              onClick={() => setHoverFate(hoverFate === f ? null : f)}
            >
              <span className="swatch" style={{ background: FATE_COLOR[f] }} />
              {FATE_LABEL[f]}
            </button>
          ))}
        </div>
        <label className="survive">
          <input
            type="checkbox"
            checked={survivorsOnly}
            onChange={(e) => toggleSurvivors(e.target.checked)}
          />
          Only what survives
        </label>
      </div>

      <div className="split">
        <div className="pane">
          <div className="files">
            {rows.map((row) => (
              <button
                type="button"
                key={row.path}
                className={[
                  "node",
                  row.node.dir || row.hasKids ? "isdir" : "",
                  row.path === selected ? "sel" : "",
                  dimmed(row.node) ? "dim" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ paddingLeft: `${8 + row.depth * 16}px` }}
                onClick={() => onNode(row)}
              >
                <span className={`caret${row.isOpen ? " open" : ""}`}>
                  {row.hasKids ? "▸" : ""}
                </span>
                {row.node.fate ? (
                  <span
                    className="dot"
                    style={{ background: FATE_COLOR[row.node.fate] }}
                  />
                ) : (
                  <span className="dot" style={{ background: "transparent" }} />
                )}
                <span className="nm">{row.node.name}</span>
                {row.node.hint ? (
                  <span className="hint">{row.node.hint}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="pane">
          {current ? (
            <div className="detail">
              <p className="path">{currentPath}</p>
              {current.fate ? (
                <>
                  <span
                    className="badge"
                    style={{ background: FATE_COLOR[current.fate] }}
                  >
                    {FATE_LABEL[current.fate]}
                  </span>
                  <p className="fate-blurb">{FATE_BLURB[current.fate]}</p>
                </>
              ) : null}
              {current.note ? <p>{current.note}</p> : null}
              {current.example ? (
                <>
                  <span className="ex-label">Example</span>
                  <pre>
                    <code>{current.example}</code>
                  </pre>
                </>
              ) : null}
            </div>
          ) : (
            <div className="detail">
              <p className="verdict">{framework.verdict}</p>
              <div className="empty">
                Click any file or folder to see what it holds, and what happens
                to it once the work ships.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
