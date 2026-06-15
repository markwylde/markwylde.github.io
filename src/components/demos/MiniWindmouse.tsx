/*
  WindMouse algorithm by Benjamin J. Land.
  https://ben.land/post/2021/04/25/windmouse-human-mouse-movement/
  The algorithm is released under the GPLv3; this is a JavaScript port for illustration.
*/
import { useEffect, useRef } from "react";

const CSS = `
.demo-windmouse .mini{display:flex;flex-direction:column;gap:12px;padding:18px}
.demo-windmouse .caption{font-size:1rem;color:var(--muted);line-height:1.6}
.demo-windmouse .caption b{color:var(--fg-strong);font-weight:600}
.demo-windmouse .caption a{color:var(--code-fg)}
.demo-windmouse .stage{display:flex;align-items:center;justify-content:center}
.demo-windmouse svg{width:100%;max-width:640px;aspect-ratio:520/240;height:auto;display:block;margin:0 auto}
.demo-windmouse .pathline{stroke:rgba(111,123,255,.5);stroke-width:1.4;fill:none}
.demo-windmouse .target{fill:#37e0c8}
.demo-windmouse .dot{fill:#fff;stroke:#1a1a1a;stroke-width:1}
.demo-windmouse .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px 18px}
.demo-windmouse label{display:flex;align-items:center;gap:8px;font-size:0.86rem;color:var(--muted)}
.demo-windmouse label input{accent-color:#6f7bff;flex:1;min-width:60px}
.demo-windmouse label b{color:var(--fg-strong);font-variant-numeric:tabular-nums;min-width:22px;text-align:right}
`;

export default function MiniWindmouse() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = root.current!;

    // --- WindMouse, ported from Benjamin J. Land's GPLv3 algorithm ---
    const s3 = Math.sqrt(3), s5 = Math.sqrt(5);
    function windMouse(sx: number, sy: number, dx: number, dy: number, G: number, W: number, M: number, D: number) {
      const pts = [[sx, sy]];
      let vx = 0, vy = 0, Wx = 0, Wy = 0, M0 = M, guard = 0;
      let dist = Math.hypot(dx - sx, dy - sy);
      while (dist >= 1 && guard++ < 8000) {
        const Wmag = Math.min(W, dist);
        if (dist >= D) {
          Wx = Wx / s3 + (2 * Math.random() - 1) * Wmag / s5;
          Wy = Wy / s3 + (2 * Math.random() - 1) * Wmag / s5;
        } else {
          Wx /= s3; Wy /= s3;
          if (M0 < 3) M0 = Math.random() * 3 + 3; else M0 /= s5;
        }
        vx += Wx + G * (dx - sx) / dist;
        vy += Wy + G * (dy - sy) / dist;
        const vmag = Math.hypot(vx, vy);
        if (vmag > M0) {
          const vc = M0 / 2 + Math.random() * M0 / 2;
          vx = (vx / vmag) * vc; vy = (vy / vmag) * vc;
        }
        sx += vx; sy += vy;
        pts.push([Math.round(sx), Math.round(sy)]);
        dist = Math.hypot(dx - sx, dy - sy);
      }
      pts.push([dx, dy]);
      return pts;
    }

    const el = (id: string) => r.querySelector('#' + id) as HTMLElement;
    const fan = el('fan') as unknown as SVGGElement;
    const dot = el('dot') as unknown as SVGCircleElement;
    const params = () => ({
      G: +(el('G') as HTMLInputElement).value,
      W: +(el('W') as HTMLInputElement).value,
      M: +(el('M') as HTMLInputElement).value,
      D: +(el('D') as HTMLInputElement).value,
    });
    const NS = 'http://www.w3.org/2000/svg';

    function toPath(pts: number[][]) { return 'M ' + pts.map(p => p[0] + ' ' + p[1]).join(' L '); }

    function drawFan() {
      const p = params();
      el('Gv').textContent = String(p.G); el('Wv').textContent = String(p.W); el('Mv').textContent = String(p.M); el('Dv').textContent = String(p.D);
      fan.innerHTML = '';
      for (let i = 0; i < 12; i++) {
        const y = 40 + i * (160 / 11);
        const pts = windMouse(40, y, 482, 120, p.G, p.W, p.M, p.D);
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('class', 'pathline'); path.setAttribute('d', toPath(pts));
        fan.appendChild(path);
      }
    }
    ['G', 'W', 'M', 'D'].forEach(id => (el(id) as HTMLInputElement).addEventListener('input', drawFan));

    // animated cursor on a fresh path each loop
    let anim: number[][] = [], idx = 0;
    function fresh() { const p = params(); anim = windMouse(40, 60 + Math.random() * 120, 482, 120, p.G, p.W, p.M, p.D); idx = 0; }
    let last = 0;
    let raf = 0;
    function frame(now: number) {
      if (now - last > 16) {
        last = now;
        if (!anim.length || idx >= anim.length) { fresh(); }
        const pt = anim[Math.min(idx, anim.length - 1)];
        dot.setAttribute('cx', String(pt[0])); dot.setAttribute('cy', String(pt[1]));
        idx += 2;
      }
      raf = requestAnimationFrame(frame);
    }
    drawFan(); fresh();
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="demo demo-windmouse" ref={root}>
      <style>{CSS}</style>
      <div className="mini">
        <div className="caption"><b>WindMouse</b> (Benjamin J. Land) takes a different route: model the cursor as a mass pulled by <b>gravity</b> toward the target and shoved by random <b>wind</b> that drifts smoothly, then integrate the physics step by step. No curve is drawn — the wiggle <i>emerges</i>. Tweak the forces:</div>
        <div className="stage">
          <svg id="svg" viewBox="0 0 520 240" preserveAspectRatio="xMidYMid meet">
            <g id="fan" />
            <circle className="target" cx="482" cy="120" r="5" />
            <circle className="dot" id="dot" r="6" />
          </svg>
        </div>
        <div className="grid">
          <label>Gravity <input type="range" id="G" min="3" max="20" defaultValue="9" /><b id="Gv">9</b></label>
          <label>Wind <input type="range" id="W" min="0" max="15" defaultValue="3" /><b id="Wv">3</b></label>
          <label>Max step <input type="range" id="M" min="5" max="30" defaultValue="15" /><b id="Mv">15</b></label>
          <label>Damp dist <input type="range" id="D" min="3" max="40" defaultValue="12" /><b id="Dv">12</b></label>
        </div>
      </div>
    </div>
  );
}
