import { useEffect, useRef } from "react";

const CSS = `
.demo-entry .mini{display:flex;flex-direction:column;gap:12px;padding:18px}
.demo-entry .caption{font-size:1rem;color:var(--muted);line-height:1.6}
.demo-entry .caption b{color:var(--fg-strong);font-weight:600}
.demo-entry .play{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.demo-entry svg{width:320px;max-width:56%;aspect-ratio:360/280;flex:0 0 auto}
.demo-entry .pad{fill:var(--pad-fill);stroke:var(--line);stroke-width:1.5}
.demo-entry .straight{stroke:var(--axis);stroke-width:1.3;stroke-dasharray:4 5;fill:none}
.demo-entry .circle{stroke:#5a4a7a;stroke-width:2;stroke-dasharray:5 5;fill:none}
.demo-entry .arc{stroke:#6f7bff;stroke-width:3.2;fill:none}
.demo-entry .seg{stroke:#37e0c8;stroke-width:3.6;fill:none}
.demo-entry .ends{fill:var(--fg-strong)}
.demo-entry .dot{fill:#fff;stroke:#1a1a1a;stroke-width:1}
.demo-entry .right{flex:1;min-width:180px;display:flex;flex-direction:column;gap:14px;font-size:1rem;color:var(--muted)}
.demo-entry .right b{color:var(--fg-strong);font-variant-numeric:tabular-nums}
.demo-entry label{display:flex;align-items:center;gap:9px}
.demo-entry input[type=range]{accent-color:#6f7bff;width:100%}
.demo-entry .key{display:flex;flex-direction:column;gap:6px;font-size:0.86rem}
.demo-entry .key span{display:flex;align-items:center;gap:8px}
.demo-entry .sw{width:18px;height:0;border-top:3px solid;border-radius:2px}
`;

export default function MiniEntry() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = root.current!;
    const S = { x: 300, y: 58 }, E = { x: 74, y: 236 };
    const PV = { x: 360 * 1.06, y: 280 * 1.28 };                 // wrist, bottom-right
    const el = (id: string) => r.querySelector("#" + id) as SVGPathElement;
    const entryEl = r.querySelector("#entry") as HTMLInputElement;

    const dx = E.x - S.x, dy = E.y - S.y, dist = Math.hypot(dx, dy);
    const mid = { x: (S.x + E.x) / 2, y: (S.y + E.y) / 2 };
    const aS = Math.atan2(S.y - PV.y, S.x - PV.x), aE = Math.atan2(E.y - PV.y, E.x - PV.x);
    let dphi = aE - aS; while (dphi > Math.PI) dphi -= 2 * Math.PI; while (dphi < -Math.PI) dphi += 2 * Math.PI;
    const R = Math.hypot(mid.x - PV.x, mid.y - PV.y);
    const sagitta = R * (1 - Math.cos(dphi / 2));
    let nx = -dy / dist, ny = dx / dist;
    if (nx * (mid.x - PV.x) + ny * (mid.y - PV.y) < 0) { nx = -nx; ny = -ny; }
    const arch = 2.2 * sagitta;
    const cubic = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, d: { x: number; y: number }, t: number) => { const u = 1 - t, uu = u * u, tt = t * t, A = uu * u, B = 3 * uu * t, C = 3 * u * tt, D = tt * t; return { x: A * a.x + B * b.x + C * c.x + D * d.x, y: A * a.y + B * b.y + C * c.y + D * d.y }; };

    // symmetric circular-ish reference (both controls offset equally)
    const sc1 = { x: S.x + dx * 0.33 + nx * arch * 0.66, y: S.y + dy * 0.33 + ny * arch * 0.66 };
    const sc2 = { x: S.x + dx * 0.66 + nx * arch * 0.66, y: S.y + dy * 0.66 + ny * arch * 0.66 };
    el("straight").setAttribute("d", `M ${S.x} ${S.y} L ${E.x} ${E.y}`);
    el("circle").setAttribute("d", `M ${S.x} ${S.y} C ${sc1.x} ${sc1.y} ${sc2.x} ${sc2.y} ${E.x} ${E.y}`);

    let c1 = { x: S.x, y: S.y }, c2 = { x: S.x, y: S.y };
    function build() {
      const e = +entryEl.value / 100;                         // 0 = bow early, 1 = long straight entry
      const o1 = arch * (0.7 * (1 - e));                       // front control offset shrinks as entry grows
      const f2 = 0.55 + 0.22 * e;
      c1 = { x: S.x + dx * 0.33 + nx * o1, y: S.y + dy * 0.33 + ny * o1 };
      c2 = { x: S.x + dx * f2 + nx * arch, y: S.y + dy * f2 + ny * arch };
      el("arc").setAttribute("d", `M ${S.x} ${S.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${E.x} ${E.y}`);
      // highlight the near-straight entry portion (first part, up to where it deviates ~ e*0.4)
      const cut = 0.12 + e * 0.30;
      let d = `M ${S.x} ${S.y}`;
      for (let i = 1; i <= 20; i++) { const t = cut * i / 20; const p = cubic(S, c1, c2, E, t); d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`; }
      el("seg").setAttribute("d", d);
      (r.querySelector("#pct") as HTMLElement).textContent = Math.round(cut * 100) + "%";
    }
    entryEl.addEventListener("input", build);

    const easeMJ = (t: number) => t * t * t * (t * (6 * t - 15) + 10);
    const DUR = 1700, PAUSE = 350; let t0: number | null = null, raf = 0;
    function frame(now: number) {
      if (t0 === null) t0 = now;
      let e = now - t0, prog;
      if (e <= DUR) prog = easeMJ(e / DUR); else if (e <= DUR + PAUSE) prog = 1; else { t0 = now; prog = 0; }
      const p = cubic(S, c1, c2, E, prog);
      el("dot").setAttribute("cx", String(p.x)); el("dot").setAttribute("cy", String(p.y));
      raf = requestAnimationFrame(frame);
    }
    build();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      entryEl.removeEventListener("input", build);
    };
  }, []);

  return (
    <div className="demo demo-entry" ref={root}>
      <style>{CSS}</style>
      <div className="mini">
        <div className="caption">Same start and end, top-right to bottom-left. A <b>circular arc</b> (dashed) bows from the very first pixel — constant curvature. A real stroke leaves <b>nearly straight</b> (the teal stretch), then the curvature ramps up and it bends into the target: a <b>clothoid</b>. Slide to control how long the straight entry lasts.</div>
        <div className="play">
          <svg id="svg" viewBox="0 0 360 280" preserveAspectRatio="xMidYMid meet">
            <rect className="pad" x="16" y="14" width="328" height="238" rx="12" />
            <path className="straight" id="straight" />
            <path className="circle" id="circle" />
            <path className="arc" id="arc" />
            <path className="seg" id="seg" />
            <circle className="ends" cx="300" cy="58" r="5" />
            <circle className="ends" cx="74" cy="236" r="5" />
            <circle className="dot" id="dot" r="6" />
          </svg>
          <div className="right">
            <label>straight entry <input type="range" id="entry" min="0" max="100" defaultValue="70" /></label>
            <div>stays straight for the first <b id="pct">—</b> of the move</div>
            <div className="key">
              <span><span className="sw" style={{ borderColor: '#5a4a7a', borderStyle: 'dashed' }} /> circular arc (constant curvature)</span>
              <span><span className="sw" style={{ borderColor: '#6f7bff' }} /> clothoid (curvature ramps up)</span>
              <span><span className="sw" style={{ borderColor: '#37e0c8' }} /> the near-straight entry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
