import { useEffect, useRef } from "react";

const CSS = `
.demo-direction .mini{display:flex;flex-direction:column;gap:12px;padding:18px}
.demo-direction .caption{font-size:1rem;color:var(--muted);line-height:1.6}
.demo-direction .caption b{color:var(--fg-strong);font-weight:600}
.demo-direction code{font-family:ui-monospace,Menlo,monospace;font-size:0.92rem;color:var(--code-fg);background:var(--code-bg);padding:3px 7px;border-radius:6px}
.demo-direction .play{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.demo-direction svg{width:320px;max-width:60%;aspect-ratio:360/300;touch-action:none;flex:0 0 auto}
.demo-direction .rose{stroke:var(--axis);stroke-width:1.4;fill:rgba(111,123,255,.06)}
.demo-direction .straight{stroke:var(--axis);stroke-width:1.5;stroke-dasharray:4 5;fill:none}
.demo-direction .curve{stroke:#6f7bff;stroke-width:3;fill:none}
.demo-direction .origin{fill:var(--fg-strong)}
.demo-direction .target{fill:#37e0c8;stroke:#0f1118;stroke-width:2.5;cursor:grab}
.demo-direction .dot{fill:#fff;stroke:#1a1a1a;stroke-width:1}
.demo-direction .axis{stroke:var(--grid);stroke-width:1}
.demo-direction .readout{flex:1;min-width:170px;display:flex;flex-direction:column;gap:10px;font-size:1rem;color:var(--muted)}
.demo-direction .readout .big{font-size:1rem}
.demo-direction .readout b{color:var(--fg-strong);font-variant-numeric:tabular-nums}
.demo-direction .bar{height:8px;border-radius:8px;background:var(--track);overflow:hidden;margin-top:3px}
.demo-direction .bar > div{height:100%;width:0;background:linear-gradient(90deg,#37e0c8,#6f7bff)}
`;

export default function MiniDirection() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = root.current!;
    const svg = r.querySelector('#svg') as unknown as SVGSVGElement;
    const O = { x: 180, y: 150 };
    const R = 120;                         // rose / reach radius
    let T = { x: 180 + R * Math.cos(-0.7), y: 150 + R * Math.sin(-0.7) };

    const el = (id: string) => r.querySelector('#' + id);
    const rose = el('rose') as SVGPathElement, straight = el('straight') as SVGLineElement, curve = el('curve') as SVGPathElement, dot = el('dot') as SVGCircleElement, target = el('target') as SVGCircleElement;

    // four-petal guide r = |sin(2θ)|
    (function drawRose() {
      let d = '';
      for (let i = 0; i <= 180; i++) { const a = i / 180 * 2 * Math.PI; const rr = Math.abs(Math.sin(2 * a)) * R; const x = O.x + rr * Math.cos(a), y = O.y - rr * Math.sin(a); d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' '; }
      rose.setAttribute('d', d + 'Z');
    })();

    const quad = (a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, t: number) => { const u = 1 - t; return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y }; };
    let ctrl = { x: O.x, y: O.y };

    function redraw() {
      const dx = T.x - O.x, dy = T.y - O.y;
      const dist = Math.hypot(dx, dy) || 1;
      const thetaScreen = Math.atan2(dy, dx);
      const thetaMath = Math.atan2(-dy, dx);            // y-up for display
      const diag = Math.abs(Math.sin(2 * thetaMath));
      const nx = -dy / dist, ny = dx / dist;                // unit perpendicular
      const bow = dist * 0.42 * diag;                   // pure |sin2θ| (no floor here, to show the effect)
      ctrl = { x: O.x + dx * 0.5 + nx * bow, y: O.y + dy * 0.5 + ny * bow };

      straight.setAttribute('x1', String(O.x)); straight.setAttribute('y1', String(O.y)); straight.setAttribute('x2', String(T.x)); straight.setAttribute('y2', String(T.y));
      curve.setAttribute('d', `M ${O.x} ${O.y} Q ${ctrl.x} ${ctrl.y} ${T.x} ${T.y}`);
      target.setAttribute('cx', String(T.x)); target.setAttribute('cy', String(T.y));

      let deg = thetaMath * 180 / Math.PI; if (deg < 0) deg += 360;
      (el('rTheta') as SVGTextElement).textContent = deg.toFixed(0) + '°';
      (el('rDiag') as SVGTextElement).textContent = diag.toFixed(2);
      (el('barDiag') as HTMLElement).style.width = (diag * 100).toFixed(0) + '%';
      (el('rBow') as SVGTextElement).textContent = bow.toFixed(0);
    }

    let drag = false;
    function toSvg(e: PointerEvent) { const rect = svg.getBoundingClientRect(); return { x: (e.clientX - rect.left) * (360 / rect.width), y: (e.clientY - rect.top) * (300 / rect.height) }; }
    const onPointerDown = (e: PointerEvent) => { drag = true; target.setPointerCapture(e.pointerId); };
    const onPointerMove = (e: PointerEvent) => {
      if (!drag) return;
      const p = toSvg(e);
      let dx = p.x - O.x, dy = p.y - O.y; const d = Math.hypot(dx, dy) || 1;
      const rad = Math.min(R, Math.max(40, d));           // keep on a sensible reach radius
      T = { x: O.x + dx / d * rad, y: O.y + dy / d * rad };
      redraw();
    };
    const onPointerUp = () => { drag = false; };
    target.addEventListener('pointerdown', onPointerDown);
    svg.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const easeMJ = (t: number) => t * t * t * (t * (6 * t - 15) + 10);
    const DUR = 1500, PAUSE = 350;
    let t0: number | null = null;
    let raf = 0;
    function frame(now: number) {
      if (t0 === null) t0 = now;
      let e = now - t0, prog;
      if (e <= DUR) prog = easeMJ(e / DUR);
      else if (e <= DUR + PAUSE) prog = 1;
      else { t0 = now; prog = 0; }
      const pt = quad(O, ctrl, T, prog);
      dot.setAttribute('cx', String(pt.x)); dot.setAttribute('cy', String(pt.y));
      raf = requestAnimationFrame(frame);
    }
    redraw();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener('pointerdown', onPointerDown);
      svg.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <div className="demo demo-direction" ref={root}>
      <style>{CSS}</style>
      <div className="mini">
        <div className="caption">Real arm movements curve <b>more on the diagonals than on the cardinals</b>. The weight <code>|sin(2θ)|</code> captures exactly that: it's 0 straight up / down / left / right, and 1 at the 45° diagonals. Drag the teal target around the centre — the bow follows the four-petal shape of that function.</div>
        <div className="play">
          <svg id="svg" viewBox="0 0 360 300" preserveAspectRatio="xMidYMid meet">
            <line className="axis" x1="30" y1="150" x2="330" y2="150" />
            <line className="axis" x1="180" y1="20" x2="180" y2="280" />
            <path className="rose" id="rose" />
            <line className="straight" id="straight" />
            <path className="curve" id="curve" />
            <circle className="origin" cx="180" cy="150" r="5" />
            <circle className="dot" id="dot" r="6" />
            <circle className="target" id="target" r="9" />
          </svg>
          <div className="readout">
            <div>angle θ = <b id="rTheta">—</b></div>
            <div>|sin(2θ)| = <b id="rDiag">—</b><div className="bar"><div id="barDiag" /></div></div>
            <div>bow = <b id="rBow">—</b> px</div>
          </div>
        </div>
      </div>
    </div>
  );
}
