// Static (no client directive): the appendix table, colour-coded so you can
// see at a glance where the gaps are rather than reading 24 cells of prose.

type State = "yes" | "part" | "no" | "info";

interface Cell {
  state: State;
  label: string;
}

interface Layer {
  icon: string;
  title: string;
  sub: string;
  cells: Cell[];
}

const CSS = `
.sf-matrix{padding:0}
.sf-matrix .scroll{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--btn-bg)}
.sf-matrix table{border-collapse:separate;border-spacing:0;width:100%;min-width:660px;font-size:0.85rem}
.sf-matrix th,.sf-matrix td{padding:11px 12px;text-align:left;vertical-align:middle;border-bottom:1px solid var(--line)}
.sf-matrix tbody tr:last-child th,.sf-matrix tbody tr:last-child td{border-bottom:none}
.sf-matrix thead th{font-size:0.78rem;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;color:var(--muted);background:var(--code-bg);white-space:nowrap}
.sf-matrix thead th:first-child{width:34%;min-width:200px}
.sf-matrix tbody th{font-weight:600;color:var(--fg-strong);width:34%;min-width:200px;background:var(--btn-bg)}
.sf-matrix tbody tr:hover th,.sf-matrix tbody tr:hover td{background:var(--code-bg)}
.sf-matrix .layer{display:flex;gap:10px;align-items:flex-start}
.sf-matrix .ico{flex-shrink:0;width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;background:rgba(111,123,255,0.14);color:#6f7bff;line-height:1}
.sf-matrix .layer .t{display:flex;flex-direction:column;gap:2px}
.sf-matrix .layer .t span{font-weight:400;font-size:0.76rem;color:var(--muted);line-height:1.4}
.sf-matrix .pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 10px;font-size:0.76rem;font-weight:600;border:1px solid transparent;white-space:nowrap}
.sf-matrix .pill code{font-family:ui-monospace,Menlo,monospace;font-size:0.72rem;background:none;border:none;padding:0;color:inherit}
.sf-matrix .pill.yes{color:#2f9e6e;background:rgba(47,158,110,0.12);border-color:rgba(47,158,110,0.32)}
.sf-matrix .pill.part{color:#b9832b;background:rgba(185,131,43,0.12);border-color:rgba(185,131,43,0.32)}
.sf-matrix .pill.no{color:var(--muted);background:var(--track);border-color:var(--line)}
.sf-matrix .pill.info{color:#6f7bff;background:rgba(111,123,255,0.12);border-color:rgba(111,123,255,0.3)}
.sf-matrix .mark{font-size:0.8rem;line-height:1}
.sf-matrix .legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:0.76rem;color:var(--muted)}
.sf-matrix .legend span{display:inline-flex;align-items:center;gap:6px}
.sf-matrix .sw{width:9px;height:9px;border-radius:3px;display:inline-block}
@media (max-width:640px){
  .sf-matrix table{font-size:0.8rem}
  .sf-matrix th,.sf-matrix td{padding:9px 10px}
}
`;

const LAYERS: Layer[] = [
  {
    icon: "▣",
    title: "Durable per-feature spec",
    sub: "one file per capability, edited as it evolves",
    cells: [
      { state: "no", label: "none" },
      { state: "yes", label: "specs/<cap>/spec.md" },
      { state: "no", label: "none" },
      { state: "no", label: "none" },
    ],
  },
  {
    icon: "▤",
    title: "Frozen increment record",
    sub: "what one slice changed, and why",
    cells: [
      { state: "info", label: "specs/NNN-*/" },
      { state: "info", label: "changes/archive/" },
      { state: "part", label: "docs/plans/ (scratch)" },
      { state: "info", label: "planning-artifacts/" },
    ],
  },
  {
    icon: "↱",
    title: "Merge back into truth",
    sub: "increments accumulate instead of scattering",
    cells: [
      { state: "part", label: "manual" },
      { state: "yes", label: "delta specs" },
      { state: "part", label: "manual" },
      { state: "part", label: "manual" },
    ],
  },
  {
    icon: "≡",
    title: "Cross-feature task state",
    sub: "one place showing outstanding work across the whole project",
    cells: [
      { state: "no", label: "none" },
      { state: "part", label: "openspec list (CLI)" },
      { state: "no", label: "none" },
      { state: "yes", label: "sprint-status.yaml" },
    ],
  },
  {
    icon: "⚑",
    title: "Enforced agent behaviour",
    sub: "TDD, review gates, worktree isolation",
    cells: [
      { state: "info", label: "phase order" },
      { state: "info", label: "zone rules" },
      { state: "yes", label: "14 skills" },
      { state: "info", label: "agent roles" },
    ],
  },
  {
    icon: "⑂",
    title: "Branch coupling",
    sub: "must the folder name match your git branch?",
    cells: [
      { state: "part", label: "required" },
      { state: "yes", label: "free" },
      { state: "info", label: "worktree per task" },
      { state: "yes", label: "free" },
    ],
  },
];

const COLUMNS = ["Spec Kit", "OpenSpec", "Superpowers", "BMAD"];

const MARK: Record<State, string> = {
  yes: "✓",
  part: "~",
  no: "—",
  info: "·",
};

const isPath = (label: string) => /[/.]/.test(label) && !label.includes(" ");

export default function LayerMatrix() {
  return (
    <div className="demo sf-matrix">
      <style>{CSS}</style>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Layer</th>
              {COLUMNS.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LAYERS.map((layer) => (
              <tr key={layer.title}>
                <th scope="row">
                  <span className="layer">
                    <span className="ico" aria-hidden="true">
                      {layer.icon}
                    </span>
                    <span className="t">
                      {layer.title}
                      <span>{layer.sub}</span>
                    </span>
                  </span>
                </th>
                {layer.cells.map((cell, i) => (
                  <td key={COLUMNS[i]}>
                    <span className={`pill ${cell.state}`}>
                      <span className="mark" aria-hidden="true">
                        {MARK[cell.state]}
                      </span>
                      {isPath(cell.label) ? (
                        <code>{cell.label}</code>
                      ) : (
                        cell.label
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <span>
          <i className="sw" style={{ background: "#2f9e6e" }} /> has it properly
        </span>
        <span>
          <i className="sw" style={{ background: "#b9832b" }} /> friction:
          manual work, or a rule you have to obey
        </span>
        <span>
          <i className="sw" style={{ background: "#6f7bff" }} /> present, but a
          different shape
        </span>
        <span>
          <i className="sw" style={{ background: "#8a8f9e" }} /> nothing there
        </span>
      </div>
    </div>
  );
}
