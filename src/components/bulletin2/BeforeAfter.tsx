import { useState } from "react";
import { BASE_CSS } from "../bulletin/bits";

const BASE = "/bulletin-part-2";

type Pair = { id: string; label: string; file: string; dark?: boolean };

const PAGES: Pair[] = [
  { id: "index", label: "Board index", file: "index", dark: true },
  { id: "forum", label: "Forum", file: "forum" },
  {
    id: "staff",
    label: "Staff dashboard",
    file: "staff-dashboard",
    dark: true,
  },
];

const CSS = `
.b2-ba{display:flex;flex-direction:column;gap:12px}
.b2-ba .bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.b2-ba .seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.b2-ba .seg button{font:inherit;font-size:.8rem;padding:5px 11px;border:0;background:var(--btn-bg);color:var(--fg);cursor:pointer}
.b2-ba .seg button+button{border-left:1px solid var(--line)}
.b2-ba .seg button[aria-pressed="true"]{background:var(--fg-strong);color:var(--btn-bg)}
.b2-ba .seg button:disabled{opacity:.4;cursor:default}
.b2-ba .stage{position:relative;margin:0 auto;width:100%;border:1px solid var(--line);border-radius:10px;overflow:hidden;user-select:none;touch-action:pan-y;background:#111}
.b2-ba .stage.phone{max-width:360px}
.b2-ba .stage img{display:block;width:100%;height:auto;margin:0;border:0;border-radius:0;pointer-events:none}
.b2-ba .before{position:absolute;inset:0}
.b2-ba .line{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);pointer-events:none}
.b2-ba .knob{position:absolute;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:#fff;color:#222;display:grid;place-items:center;font-size:.8rem;font-weight:600;box-shadow:0 0 0 1px rgba(0,0,0,.35);pointer-events:none}
.b2-ba .tag{position:absolute;top:10px;padding:2px 8px;border-radius:6px;font-size:.72rem;font-weight:600;background:rgba(0,0,0,.65);color:#fff;pointer-events:none}
.b2-ba input[type=range]{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize}
.b2-ba .cap{font-size:.78rem;color:var(--muted);text-align:center}
`;

export default function BeforeAfter() {
  const [page, setPage] = useState(PAGES[0]);
  const [phone, setPhone] = useState(false);
  const [dark, setDark] = useState(true);
  const [pos, setPos] = useState(50);
  const size = phone ? "mobile360" : "desktop";
  const useDark = !phone && dark && page.dark;
  const before = `${BASE}/before/${page.file}-${size}.png`;
  const after = `${BASE}/after/${page.file}-${size}${useDark ? "-dark" : ""}.png`;

  return (
    <div className="demo bl-x b2-ba">
      <style>{BASE_CSS + CSS}</style>
      <div className="bar">
        <div className="seg">
          {PAGES.map((p) => (
            <button
              type="button"
              key={p.id}
              aria-pressed={p.id === page.id}
              onClick={() => setPage(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="seg">
          <button
            type="button"
            aria-pressed={!phone}
            onClick={() => setPhone(false)}
          >
            1440 px
          </button>
          <button
            type="button"
            aria-pressed={phone}
            onClick={() => setPhone(true)}
          >
            360 px
          </button>
        </div>
        <div className="seg">
          <button
            type="button"
            aria-pressed={!useDark}
            disabled={phone || !page.dark}
            onClick={() => setDark(false)}
          >
            Light
          </button>
          <button
            type="button"
            aria-pressed={!!useDark}
            disabled={phone || !page.dark}
            onClick={() => setDark(true)}
          >
            Dark
          </button>
        </div>
      </div>
      <div className={`stage${phone ? " phone" : ""}`}>
        <img src={after} alt={`${page.label} after the rebuild`} />
        <div
          className="before"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img src={before} alt={`${page.label} before the rebuild`} />
        </div>
        <span className="tag" style={{ left: 10 }}>
          Before
        </span>
        <span className="tag" style={{ right: 10 }}>
          After
        </span>
        <div className="line" style={{ left: `${pos}%` }} />
        <div className="knob" style={{ left: `${pos}%` }}>
          ⇆
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          aria-label="Drag to compare before and after"
          onChange={(e) => setPos(Number(e.target.value))}
        />
      </div>
      <p className="cap">
        Drag across the image. Before is DeepSeek's UI from part 1, after is
        Claude's.
        {phone || !page.dark ? "" : " Light and dark only change the after."}
      </p>
    </div>
  );
}
