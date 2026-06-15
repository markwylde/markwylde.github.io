import { useEffect, useRef } from "react";

const CSS = `
.demo-bezier .mini{display:flex;flex-direction:column;gap:12px;padding:18px}
.demo-bezier .caption{font-size:1rem;color:var(--muted);line-height:1.6}
.demo-bezier .caption b{color:var(--fg-strong);font-weight:600}
.demo-bezier code{font-family:ui-monospace,Menlo,monospace;font-size:0.92rem;color:var(--code-fg);background:var(--code-bg);padding:3px 7px;border-radius:6px}
.demo-bezier .stage{display:flex;align-items:center;justify-content:center}
.demo-bezier svg{width:100%;max-width:560px;aspect-ratio:480/240;height:auto;display:block;margin:0 auto;touch-action:none}
.demo-bezier .straight{stroke:var(--axis);stroke-width:1.5;stroke-dasharray:4 5;fill:none}
.demo-bezier .polygon{stroke:var(--axis2);stroke-width:1.4;stroke-dasharray:3 4;fill:none}
.demo-bezier .curve{stroke:#6f7bff;stroke-width:3;fill:none}
.demo-bezier .anchor{fill:var(--fg-strong)}
.demo-bezier .ctrl{fill:#37e0c8;stroke:#0f1118;stroke-width:2.5;cursor:grab}
.demo-bezier .ctrl-label{fill:var(--muted);font-size:0.92rem;font-family:ui-monospace,monospace}
.demo-bezier .dot{fill:#fff;stroke:#1a1a1a;stroke-width:1}
`;

export default function MiniBezier() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = root.current!;
    const svg = r.querySelector('#svg') as SVGSVGElement;
    const P0 = { x: 60, y: 172 };
    const P3 = { x: 420, y: 96 };
    let C1 = { x: 150, y: 60 };
    let C2 = { x: 320, y: 60 };

    const el = (id: string) => r.querySelector('#' + id) as Element;
    const straight = el('straight'), poly = el('poly'), curve = el('curve'), dot = el('dot');
    el('p0').setAttribute('cx', String(P0.x)); el('p0').setAttribute('cy', String(P0.y));
    el('p3').setAttribute('cx', String(P3.x)); el('p3').setAttribute('cy', String(P3.y));
    straight.setAttribute('x1', String(P0.x)); straight.setAttribute('y1', String(P0.y)); straight.setAttribute('x2', String(P3.x)); straight.setAttribute('y2', String(P3.y));

    const cubic = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, d: { x: number; y: number }, t: number) => { const u = 1 - t, uu = u * u, tt = t * t; const A = uu * u, B = 3 * uu * t, C = 3 * u * tt, D = tt * t; return { x: A * a.x + B * b.x + C * c.x + D * d.x, y: A * a.y + B * b.y + C * c.y + D * d.y }; };

    function redraw() {
      curve.setAttribute('d', `M ${P0.x} ${P0.y} C ${C1.x} ${C1.y} ${C2.x} ${C2.y} ${P3.x} ${P3.y}`);
      poly.setAttribute('d', `M ${P0.x} ${P0.y} L ${C1.x} ${C1.y} M ${P3.x} ${P3.y} L ${C2.x} ${C2.y}`);
      el('c1').setAttribute('cx', String(C1.x)); el('c1').setAttribute('cy', String(C1.y));
      el('c2').setAttribute('cx', String(C2.x)); el('c2').setAttribute('cy', String(C2.y));
      el('l1').setAttribute('x', String(C1.x + 11)); el('l1').setAttribute('y', String(C1.y - 9));
      el('l2').setAttribute('x', String(C2.x + 11)); el('l2').setAttribute('y', String(C2.y - 9));
    }

    let drag: { x: number; y: number } | null = null;
    function toSvg(e: PointerEvent) { const rect = svg.getBoundingClientRect(); return { x: (e.clientX - rect.left) * (480 / rect.width), y: (e.clientY - rect.top) * (240 / rect.height) }; }
    const c1El = el('c1') as SVGCircleElement;
    const c2El = el('c2') as SVGCircleElement;
    c1El.addEventListener('pointerdown', (e: PointerEvent) => { drag = C1; c1El.setPointerCapture(e.pointerId); });
    c2El.addEventListener('pointerdown', (e: PointerEvent) => { drag = C2; c2El.setPointerCapture(e.pointerId); });
    function onPointerMove(e: PointerEvent) {
      if (!drag) return;
      const p = toSvg(e);
      drag.x = Math.max(8, Math.min(472, p.x));
      drag.y = Math.max(8, Math.min(232, p.y));
      redraw();
    }
    function onPointerUp() { drag = null; }
    svg.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const ease = (t: number) => t * t * t * (t * (6 * t - 15) + 10);   // minimum-jerk, so the dot eases too
    const DUR = 1700, PAUSE = 350;
    let t0: number | null = null;
    let raf = 0;
    function frame(now: number) {
      if (t0 === null) t0 = now;
      let e = now - t0, prog;
      if (e <= DUR) prog = ease(e / DUR);
      else if (e <= DUR + PAUSE) prog = 1;
      else { t0 = now; prog = 0; }
      const pt = cubic(P0, C1, C2, P3, prog);
      dot.setAttribute('cx', String(pt.x)); dot.setAttribute('cy', String(pt.y));
      raf = requestAnimationFrame(frame);
    }
    redraw();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      svg.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <div className="demo demo-bezier" ref={root}>
      <style>{CSS}</style>
      <div className="mini">
        <div className="caption">A path is a <b>Bézier curve</b>. Two anchors (start and end, the pale dots) are fixed; two <b>control points</b> (teal) pull the line toward them without ever being touched. Drag the teal points — that's the entire trick behind a natural arc. <code>B(t) = (1−t)³P₀ + 3(1−t)²t·C₁ + 3(1−t)t²·C₂ + t³P₃</code></div>
        <div className="stage">
          <svg id="svg" viewBox="0 0 480 240" preserveAspectRatio="xMidYMid meet">
            <line className="straight" id="straight" />
            <path className="polygon" id="poly" />
            <path className="curve" id="curve" />
            <circle className="anchor" id="p0" r="5" />
            <circle className="anchor" id="p3" r="5" />
            <text className="ctrl-label" id="l1">C₁</text>
            <text className="ctrl-label" id="l2">C₂</text>
            <circle className="ctrl" id="c1" r="8" />
            <circle className="ctrl" id="c2" r="8" />
            <circle className="dot" id="dot" r="6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
