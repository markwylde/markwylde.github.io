import { useEffect, useRef } from "react";

const CSS = `
.demo-speed{display:flex;flex-direction:column;gap:14px;padding:18px}
.demo-speed .caption{font-size:1rem;color:var(--muted);line-height:1.6;margin:0}
.demo-speed .caption b{color:var(--fg-strong);font-weight:600}
.demo-speed code{font-family:ui-monospace,Menlo,monospace;font-size:0.9em;color:var(--code-fg);background:var(--code-bg);padding:2px 6px;border-radius:5px}
.demo-speed .stage{display:flex;align-items:center;min-height:72px}
.demo-speed .track{position:relative;width:100%;height:3px;border-radius:3px;background:var(--track)}
.demo-speed .cur{position:absolute;top:50%;left:0;width:22px;height:22px;margin-top:-11px;will-change:transform;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
.demo-speed .tick{position:absolute;top:50%;width:2px;height:16px;margin-top:-8px;background:var(--tick)}
.demo-speed .row{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.demo-speed label{display:flex;align-items:center;gap:9px;font-size:0.92rem;color:var(--muted)}
.demo-speed input[type=range]{accent-color:#6f7bff;width:200px}
.demo-speed .read{font-size:1rem;color:var(--muted);font-variant-numeric:tabular-nums}
.demo-speed .read b{color:var(--fg-strong);font-weight:600}
`;

export default function MiniSpeed() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = root.current!;
    const track = r.querySelector(".track") as HTMLElement;
    const cur = r.querySelector(".cur") as HTMLElement;
    const speedEl = r.querySelector(".speed") as HTMLInputElement;
    const read = r.querySelector(".read") as HTMLElement;
    let x = 0, dir = 1, last: number | null = null, raf = 0;
    function frame(t: number) {
      if (last === null) last = t;
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      const v = +speedEl.value;
      const w = Math.max(1, track.clientWidth - 22);
      x += v * dt * dir;
      if (x >= w) { x = w; dir = -1; }
      if (x <= 0) { x = 0; dir = 1; }
      cur.style.transform = `translateX(${x}px)`;
      read.innerHTML = `v = <b>${v}</b> px/s &middot; crosses in <b>${(w / v).toFixed(2)}</b> s`;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="demo demo-speed" ref={root}>
      <style>{CSS}</style>
      <p className="caption">Linear motion: the cursor covers equal distance every frame. Speed only changes <b>how long the trip takes</b> — <code>duration = distance ÷ speed</code> — never the shape of it. Drag the slider and watch it lurch off and stop dead at each end.</p>
      <div className="stage">
        <div className="track">
          <span className="tick" style={{ left: 0 }} />
          <span className="tick" style={{ right: 0 }} />
          <svg className="cur" viewBox="0 0 24 24"><path d="M3 2 L3 19 L8 14.5 L11 21 L14 19.5 L11 13 L17.5 13 Z" fill="#ffffff" stroke="#1a1a1a" strokeWidth="1.3" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <div className="row">
        <label>Speed <input className="speed" type="range" min={150} max={1600} defaultValue={600} /></label>
        <span className="read" />
      </div>
    </div>
  );
}
