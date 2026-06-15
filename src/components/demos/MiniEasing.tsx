import { useEffect, useRef } from "react";

const CSS = `
.demo-easing .mini{display:flex;flex-direction:column;gap:12px;padding:18px}
.demo-easing .caption{font-size:1rem;color:var(--muted);line-height:1.6}
.demo-easing .caption b{color:var(--fg-strong);font-weight:600}
.demo-easing .play{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
.demo-easing .graph{width:248px;max-width:46%;aspect-ratio:260/220;touch-action:none;flex:0 0 auto}
.demo-easing .right{flex:1;min-width:200px;display:flex;flex-direction:column;gap:16px}
.demo-easing .track{position:relative;width:100%;height:3px;border-radius:3px;background:var(--track)}
.demo-easing .track .cur{position:absolute;top:50%;left:0;width:20px;height:20px;margin-top:-10px;will-change:transform;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
.demo-easing .track .tick{position:absolute;top:50%;width:2px;height:14px;margin-top:-7px;background:var(--tick)}
.demo-easing .meter-wrap{display:flex;align-items:center;gap:10px;font-size:0.82rem;color:var(--muted)}
.demo-easing .meter{flex:1;height:8px;border-radius:8px;background:var(--track);overflow:hidden}
.demo-easing .meter-fill{height:100%;width:0;background:linear-gradient(90deg,#37e0c8,#6f7bff);border-radius:8px}
.demo-easing .row{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.demo-easing .btn{appearance:none;border:1px solid var(--line);background:var(--btn-bg);color:var(--fg-strong);font:inherit;font-size:0.86rem;font-weight:600;padding:6px 11px;border-radius:8px;cursor:pointer}
.demo-easing .btn.active{background:#3584e4;border-color:#3584e4;color:#fff}
.demo-easing code{font-family:ui-monospace,Menlo,monospace;font-size:0.92rem;color:var(--code-fg);background:var(--code-bg);padding:4px 8px;border-radius:6px}
.demo-easing .gridline{stroke:var(--grid);stroke-width:1}
.demo-easing .axis{stroke:var(--axis);stroke-width:1.4}
.demo-easing .ctrlline{stroke:var(--axis2);stroke-width:1.4;stroke-dasharray:3 4}
.demo-easing .curve{stroke:#6f7bff;stroke-width:2.6;fill:none}
.demo-easing .handle{fill:#37e0c8;stroke:#0f1118;stroke-width:2;cursor:grab}
.demo-easing .handle:active{cursor:grabbing}
.demo-easing .marker{fill:#fff}
`;

export default function MiniEasing() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = root.current!;
    const GX0 = 30, GX1 = 230, GY0 = 190, GY1 = 30;            // graph plot box in viewBox units
    const sx = (u: number) => GX0 + u * (GX1 - GX0);
    const sy = (v: number) => GY0 - v * (GY0 - GY1);
    const usx = (px: number) => (px - GX0) / (GX1 - GX0);
    const usy = (py: number) => (GY0 - py) / (GY0 - GY1);

    const graph = r.querySelector('#graph') as SVGSVGElement;
    const curve = r.querySelector('#curve') as SVGPathElement;
    const cl1 = r.querySelector('#cl1') as SVGLineElement, cl2 = r.querySelector('#cl2') as SVGLineElement;
    const h1 = r.querySelector('#h1') as SVGCircleElement, h2 = r.querySelector('#h2') as SVGCircleElement;
    const marker = r.querySelector('#marker') as SVGCircleElement;
    const cur = r.querySelector('#cur') as SVGSVGElement, track = cur.parentElement as HTMLElement;
    const meter = r.querySelector('#meter') as HTMLElement;
    const cssEl = r.querySelector('#css') as HTMLElement;
    const presetsEl = r.querySelector('#presets') as HTMLElement;

    let P = { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };
    const clamp = (lo: number, hi: number, v: number) => Math.max(lo, Math.min(hi, v));

    function solver(x1: number, y1: number, x2: number, y2: number) {
      const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
      const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
      const fx = (t: number) => ((ax * t + bx) * t + cx) * t, fy = (t: number) => ((ay * t + by) * t + cy) * t, dfx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
      return (p: number) => { if (p <= 0) return 0; if (p >= 1) return 1; let t = p; for (let i = 0; i < 8; i++) { const x = fx(t) - p; if (Math.abs(x) < 1e-5) break; const d = dfx(t); if (Math.abs(d) < 1e-6) break; t -= x / d; } return fy(clamp(0, 1, t)); };
    }
    let ease = solver(P.x1, P.y1, P.x2, P.y2);

    function redraw() {
      curve.setAttribute('d', `M ${sx(0)} ${sy(0)} C ${sx(P.x1)} ${sy(P.y1)} ${sx(P.x2)} ${sy(P.y2)} ${sx(1)} ${sy(1)}`);
      cl1.setAttribute('x1', String(sx(0))); cl1.setAttribute('y1', String(sy(0))); cl1.setAttribute('x2', String(sx(P.x1))); cl1.setAttribute('y2', String(sy(P.y1)));
      cl2.setAttribute('x1', String(sx(1))); cl2.setAttribute('y1', String(sy(1))); cl2.setAttribute('x2', String(sx(P.x2))); cl2.setAttribute('y2', String(sy(P.y2)));
      h1.setAttribute('cx', String(sx(P.x1))); h1.setAttribute('cy', String(sy(P.y1)));
      h2.setAttribute('cx', String(sx(P.x2))); h2.setAttribute('cy', String(sy(P.y2)));
      cssEl.textContent = `cubic-bezier(${P.x1.toFixed(2)}, ${P.y1.toFixed(2)}, ${P.x2.toFixed(2)}, ${P.y2.toFixed(2)})`;
      ease = solver(P.x1, P.y1, P.x2, P.y2);
    }

    // ---- dragging handles ----
    let drag: string | null = null;
    function toUnit(e: PointerEvent) {
      const rect = graph.getBoundingClientRect();
      const px = (e.clientX - rect.left) * (260 / rect.width);
      const py = (e.clientY - rect.top) * (220 / rect.height);
      return { u: clamp(0, 1, usx(px)), v: clamp(-0.3, 1.3, usy(py)) };
    }
    h1.addEventListener('pointerdown', (e: PointerEvent) => { drag = '1'; h1.setPointerCapture(e.pointerId); });
    h2.addEventListener('pointerdown', (e: PointerEvent) => { drag = '2'; h2.setPointerCapture(e.pointerId); });
    graph.addEventListener('pointermove', (e: PointerEvent) => {
      if (!drag) return;
      const { u, v } = toUnit(e);
      if (drag === '1') { P.x1 = u; P.y1 = v; } else { P.x2 = u; P.y2 = v; }
      setActivePreset(null); redraw();
    });
    function onPointerUp() { drag = null; }
    window.addEventListener('pointerup', onPointerUp);

    // ---- presets ----
    const presets = [
      { name: 'linear', v: [0, 0, 1, 1] },
      { name: 'ease', v: [.25, .1, .25, 1] },
      { name: 'ease-in-out', v: [.42, 0, .58, 1] },
      { name: 'reach', v: [.3, 0, .7, 1] },
    ];
    let activeBtn: HTMLElement | null = null;
    function setActivePreset(btn: HTMLElement | null) { if (activeBtn) activeBtn.classList.remove('active'); activeBtn = btn; if (btn) btn.classList.add('active'); }
    presets.forEach(pr => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = pr.name;
      b.addEventListener('click', () => { P = { x1: pr.v[0], y1: pr.v[1], x2: pr.v[2], y2: pr.v[3] }; setActivePreset(b); redraw(); });
      presetsEl.appendChild(b);
      if (pr.name === 'ease-in-out') setActivePreset(b);
    });

    // ---- animation loop ----
    const DUR = 1500, PAUSE = 380;
    let t0: number | null = null, prevVal = 0, prevT: number | null = null;
    let raf = 0;
    function frame(now: number) {
      if (t0 === null) t0 = now;
      let elapsed = now - t0;
      let prog;
      if (elapsed <= DUR) prog = elapsed / DUR;
      else if (elapsed <= DUR + PAUSE) prog = 1;
      else { t0 = now; prog = 0; prevVal = 0; }
      const val = ease(prog);
      const w = Math.max(1, track.clientWidth - 20);   // svg has no offsetWidth; cursor is 20px
      cur.style.transform = `translateX(${val * w}px)`;
      marker.setAttribute('cx', String(sx(prog))); marker.setAttribute('cy', String(sy(val)));
      // speed meter = normalised instantaneous velocity
      if (prevT !== null) {
        const dt = Math.max(1, now - prevT);
        const speed = Math.abs(val - prevVal) / dt;     // value units per ms
        meter.style.width = clamp(0, 100, speed * 60000) + '%';
      }
      prevVal = val; prevT = now;
      raf = requestAnimationFrame(frame);
    }
    redraw();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <div className="demo demo-easing" ref={root}>
      <style>{CSS}</style>
      <div className="mini">
        <div className="caption">An <b>easing function</b> remaps progress: real time goes in along the bottom, the eased value comes out up the side. The motion stays a straight A→B line — easing only changes <b>when</b> you're where. Drag the teal handles (that's literally CSS <code>cubic-bezier()</code>) and watch the dot's speed meter swell and fade.</div>
        <div className="play">
          <svg className="graph" id="graph" viewBox="0 0 260 220">
            <line className="gridline" x1="30" y1="110" x2="230" y2="110" />
            <line className="gridline" x1="130" y1="30" x2="130" y2="190" />
            <rect x="30" y="30" width="200" height="160" fill="none" className="axis" />
            <line className="ctrlline" id="cl1" />
            <line className="ctrlline" id="cl2" />
            <path className="curve" id="curve" />
            <circle className="marker" id="marker" r="4" />
            <circle className="handle" id="h1" r="7" />
            <circle className="handle" id="h2" r="7" />
          </svg>
          <div className="right">
            <div className="track">
              <span className="tick" style={{ left: '0' }} /><span className="tick" style={{ right: '0' }} />
              <svg className="cur" id="cur" viewBox="0 0 24 24"><path d="M3 2 L3 19 L8 14.5 L11 21 L14 19.5 L11 13 L17.5 13 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.3" strokeLinejoin="round" /></svg>
            </div>
            <div className="meter-wrap">speed<div className="meter"><div className="meter-fill" id="meter" /></div></div>
            <div className="row" id="presets" />
            <div><code id="css">cubic-bezier(0.42, 0, 0.58, 1)</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
