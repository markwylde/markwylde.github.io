import { useEffect, useRef } from "react";

const CSS = `
.demo-handed-aim .mini{display:flex;flex-direction:column;gap:12px;padding:18px}
.demo-handed-aim .caption{font-size:1rem;color:var(--muted);line-height:1.6}
.demo-handed-aim .caption b{color:var(--fg-strong);font-weight:600}
.demo-handed-aim .play{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.demo-handed-aim svg{width:320px;max-width:58%;aspect-ratio:360/280;touch-action:none;flex:0 0 auto}
.demo-handed-aim .pad{fill:var(--pad-fill);stroke:var(--line);stroke-width:1.5}
.demo-handed-aim .straight{stroke:var(--axis);stroke-width:1.4;stroke-dasharray:4 5;fill:none}
.demo-handed-aim .radial{stroke:var(--axis);stroke-width:1.2;stroke-dasharray:2 4;fill:none}
.demo-handed-aim .arc{stroke:#6f7bff;stroke-width:3;fill:none}
.demo-handed-aim .origin{fill:var(--fg-strong)}
.demo-handed-aim .target{fill:#37e0c8;stroke:#0f1118;stroke-width:2.5;cursor:grab}
.demo-handed-aim .dot{fill:#fff;stroke:#1a1a1a;stroke-width:1}
.demo-handed-aim .palm{font-size:20px}
.demo-handed-aim .palm-ring{fill:rgba(55,224,200,.10);stroke:rgba(55,224,200,.4);stroke-width:1.4;stroke-dasharray:3 4}
.demo-handed-aim .readout{flex:1;min-width:160px;display:flex;flex-direction:column;gap:9px;font-size:1rem;color:var(--muted)}
.demo-handed-aim .readout b{color:var(--fg-strong);font-variant-numeric:tabular-nums}
.demo-handed-aim .bar{height:7px;border-radius:7px;background:var(--track);overflow:hidden;margin-top:2px}
.demo-handed-aim .bar > div{height:100%;width:0;background:linear-gradient(90deg,#37e0c8,#6f7bff)}
.demo-handed-aim .btn{appearance:none;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg-strong);font:inherit;font-size:0.86rem;font-weight:600;padding:6px 12px;border-radius:8px;cursor:pointer;margin-right:8px}
.demo-handed-aim .btn.active{background:#3584e4;border-color:#3584e4;color:#fff}
`;

export default function MiniHandedAim() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = root.current!;
    const svg = r.querySelector("#svg") as unknown as SVGSVGElement;
    const W = 360, H = 280;
    const O = { x: 180, y: 140 };
    let T = { x: 96, y: 64 };
    let handed = "right";
    let c1 = { x: O.x, y: O.y }, c2 = { x: O.x, y: O.y };

    const el = (id: string) => r.querySelector("#" + id) as Element;
    const pivotFor = () => handed === "left" ? { x: -W * 0.10, y: H * 1.30 } : { x: W * 1.10, y: H * 1.30 };
    const cubic = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, d: { x: number; y: number }, t: number) => { const u = 1 - t, uu = u * u, tt = t * t, A = uu * u, B = 3 * uu * t, C = 3 * u * tt, D = tt * t; return { x: A * a.x + B * b.x + C * c.x + D * d.x, y: A * a.y + B * b.y + C * c.y + D * d.y }; };

    function redraw() {
      const pv = pivotFor();
      const dx = T.x - O.x, dy = T.y - O.y, dist = Math.hypot(dx, dy) || 1;
      const mid = { x: (O.x + T.x) / 2, y: (O.y + T.y) / 2 };
      const aS = Math.atan2(O.y - pv.y, O.x - pv.x), aE = Math.atan2(T.y - pv.y, T.x - pv.x);
      let dphi = aE - aS; while (dphi > Math.PI) dphi -= 2 * Math.PI; while (dphi < -Math.PI) dphi += 2 * Math.PI;
      const R = Math.hypot(mid.x - pv.x, mid.y - pv.y) || 1;
      const sagitta = R * (1 - Math.cos(dphi / 2));
      let nx = -dy / dist, ny = dx / dist;
      if (nx * (mid.x - pv.x) + ny * (mid.y - pv.y) < 0) { nx = -nx; ny = -ny; }
      const arch = Math.min(dist * 0.7, 2.2 * sagitta);
      const o1 = arch * 0.1;
      c1 = { x: O.x + dx * 0.34 + nx * o1, y: O.y + dy * 0.34 + ny * o1 };
      c2 = { x: O.x + dx * 0.70 + nx * arch, y: O.y + dy * 0.70 + ny * arch };

      (el("straight") as SVGLineElement).setAttribute("x1", String(O.x)); (el("straight") as SVGLineElement).setAttribute("y1", String(O.y)); (el("straight") as SVGLineElement).setAttribute("x2", String(T.x)); (el("straight") as SVGLineElement).setAttribute("y2", String(T.y));
      (el("arc") as SVGPathElement).setAttribute("d", `M ${O.x} ${O.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${T.x} ${T.y}`);
      (el("target") as SVGCircleElement).setAttribute("cx", String(T.x)); (el("target") as SVGCircleElement).setAttribute("cy", String(T.y));
      const rdx = pv.x - O.x, rdy = pv.y - O.y, rd = Math.hypot(rdx, rdy) || 1;
      (el("radial") as SVGLineElement).setAttribute("x1", String(O.x - rdx / rd * 120)); (el("radial") as SVGLineElement).setAttribute("y1", String(O.y - rdy / rd * 120));
      (el("radial") as SVGLineElement).setAttribute("x2", String(O.x + rdx / rd * 150)); (el("radial") as SVGLineElement).setAttribute("y2", String(O.y + rdy / rd * 150));
      const px = handed === "left" ? 28 : 318, py = 240;
      (el("palm") as SVGTextElement).setAttribute("x", String(px - 10)); (el("palm") as SVGTextElement).setAttribute("y", String(py + 7));
      (el("ring") as SVGCircleElement).setAttribute("cx", String(px)); (el("ring") as SVGCircleElement).setAttribute("cy", String(py));

      const deg = Math.abs(dphi * 180 / Math.PI);
      (el("rPhi") as HTMLElement).textContent = deg.toFixed(0) + "°"; (el("barPhi") as HTMLElement).style.width = Math.min(100, deg / 70 * 100).toFixed(0) + "%";
      (el("rR") as HTMLElement).textContent = R.toFixed(0);
      (el("rBow") as HTMLElement).textContent = sagitta.toFixed(0);
    }

    let drag = false;
    function toSvg(e: PointerEvent) { const rect = svg.getBoundingClientRect(); return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) }; }
    (el("target") as SVGCircleElement).addEventListener("pointerdown", (e) => { drag = true; (el("target") as SVGCircleElement).setPointerCapture((e as PointerEvent).pointerId); });
    const onMove = (e: PointerEvent) => {
      if (!drag) return; const p = toSvg(e);
      T = { x: Math.max(26, Math.min(334, p.x)), y: Math.max(24, Math.min(244, p.y)) };
      redraw();
    };
    svg.addEventListener("pointermove", onMove as EventListener);
    const onUp = () => { drag = false; };
    window.addEventListener("pointerup", onUp);

    (el("bRight") as HTMLButtonElement).addEventListener("click", () => { handed = "right"; (el("bRight") as HTMLButtonElement).classList.add("active"); (el("bLeft") as HTMLButtonElement).classList.remove("active"); redraw(); });
    (el("bLeft") as HTMLButtonElement).addEventListener("click", () => { handed = "left"; (el("bLeft") as HTMLButtonElement).classList.add("active"); (el("bRight") as HTMLButtonElement).classList.remove("active"); redraw(); });

    const easeMJ = (t: number) => t * t * t * (t * (6 * t - 15) + 10);
    const DUR = 1500, PAUSE = 350; let t0: number | null = null;
    let raf = 0;
    function frame(now: number) {
      if (t0 === null) t0 = now;
      let e = now - t0, prog;
      if (e <= DUR) prog = easeMJ(e / DUR); else if (e <= DUR + PAUSE) prog = 1; else { t0 = now; prog = 0; }
      const pt = cubic(O, c1, c2, T, prog);
      (el("dot") as SVGCircleElement).setAttribute("cx", String(pt.x)); (el("dot") as SVGCircleElement).setAttribute("cy", String(pt.y));
      raf = requestAnimationFrame(frame);
    }
    redraw();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener("pointermove", onMove as EventListener);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="demo demo-handed-aim" ref={root}>
      <style>{CSS}</style>
      <div className="mini">
        <div className="caption">The faint dotted line runs from the centre to the wrist. Drag the target <b>along</b> that line (longitudinal) and the stroke stays straight; drag it <b>across</b> (lateral) and it bows around the wrist — leaving the start almost straight and bending into the target. Δφ is the angular sweep that drives it.</div>
        <div className="play">
          <svg id="svg" viewBox="0 0 360 280" preserveAspectRatio="xMidYMid meet">
            <rect className="pad" x="16" y="14" width="328" height="238" rx="12" />
            <circle className="palm-ring" id="ring" r="15" />
            <text className="palm" id="palm">🤚</text>
            <line className="radial" id="radial" />
            <line className="straight" id="straight" />
            <path className="arc" id="arc" />
            <circle className="origin" cx="180" cy="140" r="5" />
            <circle className="dot" id="dot" r="6" />
            <circle className="target" id="target" r="9" />
          </svg>
          <div className="readout">
            <div><button className="btn active" id="bRight">Right</button><button className="btn" id="bLeft">Left</button></div>
            <div>sweep Δφ = <b id="rPhi">—</b><div className="bar"><div id="barPhi"></div></div></div>
            <div>radius R = <b id="rR">—</b> px</div>
            <div>arch = <b id="rBow">—</b> px</div>
          </div>
        </div>
      </div>
    </div>
  );
}
