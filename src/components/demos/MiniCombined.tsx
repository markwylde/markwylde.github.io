// Wind perturbation adapted from Benjamin J. Land's WindMouse (GPLv3): https://ben.land/post/2021/04/25/windmouse-human-mouse-movement/
import { useEffect, useRef } from "react";

const CSS = `
.demo-combined .mini{display:flex;flex-direction:column;gap:12px;padding:18px}
.demo-combined .caption{font-size:1rem;color:var(--muted);line-height:1.6}
.demo-combined .caption b{color:var(--fg-strong);font-weight:600}
.demo-combined .play{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.demo-combined svg{width:320px;max-width:60%;aspect-ratio:360/280;flex:0 0 auto}
.demo-combined .pad{fill:var(--pad-fill);stroke:var(--line);stroke-width:1.5}
.demo-combined .guide{stroke:#5a4a7a;stroke-width:2;stroke-dasharray:5 5;fill:none}
.demo-combined .real{stroke:#37e0c8;stroke-width:2.4;fill:none}
.demo-combined .ends{fill:var(--fg-strong)}
.demo-combined .dot{fill:#fff;stroke:#1a1a1a;stroke-width:1}
.demo-combined .palm{font-size:20px}
.demo-combined .right{flex:1;min-width:170px;display:flex;flex-direction:column;gap:14px;font-size:1rem;color:var(--muted)}
.demo-combined label{display:flex;align-items:center;gap:9px}
.demo-combined input[type=range]{accent-color:#6f7bff;width:100%}
.demo-combined .key{display:flex;flex-direction:column;gap:6px;font-size:0.86rem}
.demo-combined .key span{display:flex;align-items:center;gap:8px}
.demo-combined .sw{width:18px;height:0;border-top:3px solid;border-radius:2px}
.demo-combined b{color:var(--fg-strong)}
`;

export default function MiniCombined() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = root.current!;
    const S = { x: 300, y: 60 }, E = { x: 70, y: 240 };
    const PV = { x: 360 * 1.06, y: 280 * 1.28 };
    const el = (id: string) => r.querySelector("#" + id);
    const windEl = el("wind") as HTMLInputElement;
    const palm = el("palm") as SVGTextElement;
    palm.setAttribute("x", String(318 - 10));
    palm.setAttribute("y", String(240 + 7));

    // --- our clothoid arc (the guide) ---
    const dx = E.x - S.x, dy = E.y - S.y, dist = Math.hypot(dx, dy);
    const mid = { x: (S.x + E.x) / 2, y: (S.y + E.y) / 2 };
    const aS = Math.atan2(S.y - PV.y, S.x - PV.x), aE = Math.atan2(E.y - PV.y, E.x - PV.x);
    let dphi = aE - aS; while (dphi > Math.PI) dphi -= 2 * Math.PI; while (dphi < -Math.PI) dphi += 2 * Math.PI;
    const R = Math.hypot(mid.x - PV.x, mid.y - PV.y);
    const sagitta = R * (1 - Math.cos(dphi / 2));
    let nx = -dy / dist, ny = dx / dist;
    if (nx * (mid.x - PV.x) + ny * (mid.y - PV.y) < 0) { nx = -nx; ny = -ny; }
    const arch = Math.min(dist * 0.7, 2.2 * sagitta);
    const c1 = { x: S.x + dx * 0.34 + nx * arch * 0.1, y: S.y + dy * 0.34 + ny * arch * 0.1 };
    const c2 = { x: S.x + dx * 0.70 + nx * arch, y: S.y + dy * 0.70 + ny * arch };
    const cubic = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, d: { x: number; y: number }, t: number) => { const u = 1 - t, uu = u * u, tt = t * t, A = uu * u, B = 3 * uu * t, C = 3 * u * tt, D = tt * t; return { x: A * a.x + B * b.x + C * c.x + D * d.x, y: A * a.y + B * b.y + C * c.y + D * d.y }; };
    (el("guide") as SVGPathElement).setAttribute("d", `M ${S.x} ${S.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${E.x} ${E.y}`);

    // waypoints along the arc
    const WP: { x: number; y: number }[] = [];
    for (let i = 0; i <= 26; i++) WP.push(cubic(S, c1, c2, E, i / 26));

    // --- guided WindMouse: chase the waypoints, wind perturbs ---
    const s3 = Math.sqrt(3), s5 = Math.sqrt(5);
    function guidedPath(windForce: number) {
      let x = S.x, y = S.y, vx = 0, vy = 0, Wx = 0, Wy = 0, wi = 1, guard = 0;
      const G = 10, M = 11;
      const pts: number[][] = [[x, y]];
      while (wi < WP.length && guard++ < 5000) {
        const t = WP[wi];
        let gx = t.x - x, gy = t.y - y, d = Math.hypot(gx, gy);
        if (d < 9) { wi++; continue; }
        Wx = Wx / s3 + (2 * Math.random() - 1) * windForce / s5;
        Wy = Wy / s3 + (2 * Math.random() - 1) * windForce / s5;
        vx += Wx + G * gx / d;
        vy += Wy + G * gy / d;
        const vm = Math.hypot(vx, vy);
        if (vm > M) { const vc = M / 2 + Math.random() * M / 2; vx = vx / vm * vc; vy = vy / vm * vc; }
        x += vx; y += vy;
        pts.push([x, y]);
      }
      pts.push([E.x, E.y]);
      return pts;
    }

    function toPath(pts: number[][]) { return "M " + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L "); }

    let path: number[][] = [], idx = 0;
    function regen() { const wf = +windEl.value / 10; (el("wv") as HTMLElement).textContent = wf.toFixed(1); path = guidedPath(wf); (el("real") as SVGPathElement).setAttribute("d", toPath(path)); idx = 0; }
    windEl.addEventListener("input", regen);

    let last = 0, raf = 0;
    function frame(now: number) {
      if (now - last > 16) {
        last = now;
        if (!path.length || idx >= path.length) { regen(); }
        const p = path[Math.min(idx, path.length - 1)];
        const dot = el("dot") as SVGCircleElement;
        dot.setAttribute("cx", String(p[0])); dot.setAttribute("cy", String(p[1]));
        idx += 2;
      }
      raf = requestAnimationFrame(frame);
    }
    regen();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      windEl.removeEventListener("input", regen);
    };
  }, []);

  return (
    <div className="demo demo-combined" ref={root}>
      <style>{CSS}</style>
      <div className="mini">
        <div className="caption">The dashed line is the <b>biomechanical clothoid arc</b> — the macro shape, from the wrist geometry. The teal path is a cursor that <b>chases that arc</b> under gravity while WindMouse-style <b>wind</b> jitters it off course and it corrects: clean intent, human tremor. Turn the wind up and down.</div>
        <div className="play">
          <svg id="svg" viewBox="0 0 360 280" preserveAspectRatio="xMidYMid meet">
            <rect className="pad" x="16" y="14" width="328" height="238" rx="12" />
            <path className="guide" id="guide" />
            <path className="real" id="real" />
            <circle className="ends" cx="300" cy="60" r="5" />
            <circle className="ends" cx="70" cy="240" r="5" />
            <text className="palm" id="palm">🤚</text>
            <circle className="dot" id="dot" r="6" />
          </svg>
          <div className="right">
            <label>wind <input type="range" id="wind" min="0" max="80" defaultValue="35" /></label>
            <div>wind force: <b id="wv">—</b></div>
            <div className="key">
              <span><span className="sw" style={{ borderColor: '#5a4a7a', borderStyle: 'dashed' }}></span> intended arc (guide)</span>
              <span><span className="sw" style={{ borderColor: '#37e0c8' }}></span> actual path (with tremor)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
