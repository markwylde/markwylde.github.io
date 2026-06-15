import { useEffect, useRef } from "react";

const CSS = `
.demo-handed-field .mini{display:flex;flex-direction:column;gap:12px;padding:18px}
.demo-handed-field .caption{font-size:1rem;color:var(--muted);line-height:1.6}
.demo-handed-field .caption b{color:var(--fg-strong);font-weight:600}
.demo-handed-field .stage{display:flex;align-items:center;justify-content:center}
.demo-handed-field svg{width:100%;height:100%;touch-action:none}
.demo-handed-field .pad{fill:var(--pad-fill);stroke:var(--line);stroke-width:1.5}
.demo-handed-field .arc{stroke:#6f7bff;stroke-width:2.4;fill:none}
.demo-handed-field .end{fill:#37e0c8}
.demo-handed-field .palm{font-size:22px}
.demo-handed-field .palm-ring{fill:rgba(55,224,200,.10);stroke:rgba(55,224,200,.4);stroke-width:1.4;stroke-dasharray:3 4}
.demo-handed-field .row{display:flex;align-items:center;gap:10px}
.demo-handed-field .btn{appearance:none;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg-strong);font:inherit;font-size:0.86rem;font-weight:600;padding:6px 12px;border-radius:8px;cursor:pointer}
.demo-handed-field .btn.active{background:#3584e4;border-color:#3584e4;color:#fff}
`;

export default function MiniHandedField() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = root.current!;
    const field = r.querySelector("#field") as SVGGElement;
    const palm = r.querySelector("#palm") as SVGTextElement;
    const ring = r.querySelector("#ring") as SVGCircleElement;
    const handsEl = r.querySelector("#hands") as HTMLElement;
    const NS = "http://www.w3.org/2000/svg";
    const W = 360, H = 250;
    let handed = "right";

    type Pt = { x: number; y: number };

    const pivotFor = (): Pt =>
      handed === "left" ? { x: -W * 0.1, y: H * 1.28 } : { x: W * 1.1, y: H * 1.28 };

    // a lateral stroke of length L centred at M: arc on the circle of radius |M-Pv| about Pv
    function lateralArc(M: Pt, L: number, pv: Pt) {
      const rx = M.x - pv.x, ry = M.y - pv.y, R = Math.hypot(rx, ry) || 1;
      const radx = rx / R, rady = ry / R;          // unit, pivot -> point (away from pivot)
      const tx = -rady, ty = radx;             // tangential (perpendicular)
      const S = { x: M.x - tx * L / 2, y: M.y - ty * L / 2 };
      const E = { x: M.x + tx * L / 2, y: M.y + ty * L / 2 };
      const dphi = 2 * Math.asin(Math.min(1, (L / 2) / R));
      const sagitta = R * (1 - Math.cos(dphi / 2));
      const C = { x: M.x + radx * 2 * sagitta, y: M.y + rady * 2 * sagitta };   // control bulges away from pivot
      return { S, E, C };
    }

    function draw() {
      const pv = pivotFor();
      field.innerHTML = "";
      for (let cx = 58; cx <= 302; cx += 61) {
        for (let cy = 52; cy <= 198; cy += 49) {
          const { S, E, C } = lateralArc({ x: cx, y: cy }, 46, pv);
          const a = document.createElementNS(NS, "path");
          a.setAttribute("class", "arc"); a.setAttribute("d", `M ${S.x} ${S.y} Q ${C.x} ${C.y} ${E.x} ${E.y}`);
          const d = document.createElementNS(NS, "circle");
          d.setAttribute("class", "end"); d.setAttribute("cx", String(E.x)); d.setAttribute("cy", String(E.y)); d.setAttribute("r", "2.6");
          field.appendChild(a); field.appendChild(d);
        }
      }
      const px = handed === "left" ? 26 : 320, py = 212;
      palm.setAttribute("x", String(px - 11)); palm.setAttribute("y", String(py + 8));
      ring.setAttribute("cx", String(px)); ring.setAttribute("cy", String(py));
    }

    ([["right", "Right-handed"], ["left", "Left-handed"]] as const).forEach(([h, label]) => {
      const b = document.createElement("button");
      b.className = "btn" + (h === handed ? " active" : ""); b.textContent = label;
      b.addEventListener("click", () => { handed = h; [...handsEl.children].forEach(c => c.classList.remove("active")); b.classList.add("active"); draw(); });
      handsEl.appendChild(b);
    });
    draw();
  }, []);

  return (
    <div className="demo demo-handed-field" ref={root}>
      <style>{CSS}</style>
      <div className="mini">
        <div className="caption">Each stroke here is a <b>lateral (sideways) swipe</b>, the kind that traces a circular arc centred on the wrist. They fan out as concentric arcs around the palm — and they're <b>tighter near the palm, gentler far away</b>, because curvature is 1 ÷ radius. Flip the handedness and the whole fan mirrors.</div>
        <div className="stage">
          <svg id="svg" viewBox="0 0 360 250" preserveAspectRatio="xMidYMid meet">
            <rect className="pad" x="16" y="14" width="328" height="208" rx="12" />
            <circle className="palm-ring" id="ring" r="16" />
            <text className="palm" id="palm">🤚</text>
            <g id="field"></g>
          </svg>
        </div>
        <div className="row" id="hands"></div>
      </div>
    </div>
  );
}
