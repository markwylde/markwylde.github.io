import { useEffect, useRef } from "react";

const CSS = `
.demo-cursor{max-width:1000px;margin:1.75rem auto;border:1px solid var(--border-color);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;
  --accent:#3584e4;       /* Adwaita blue   */
  --accent-2:#33d17a;     /* Adwaita green  */
  --danger:#e01b24;       /* Adwaita red    */
  --win-bg:#fafafb;
  --win-head:#ebebed;
  --win-text:#2e3436;
  --win-dim:#5e5c64;}

/* ---------- desktop / wallpaper ---------- */
.demo-cursor .screen{position:relative;width:100%;flex:1;min-height:0;overflow:hidden;user-select:none;cursor:default;aspect-ratio:16/10;
  background:
    radial-gradient(60% 60% at 24% 24%, rgba(96,156,255,.55), transparent 60%),
    radial-gradient(55% 55% at 82% 28%, rgba(150,96,224,.45), transparent 60%),
    radial-gradient(70% 70% at 60% 95%, rgba(54,200,200,.30), transparent 60%),
    linear-gradient(135deg,#2c3a8c,#3a2f7a 60%,#241f54);}

/* ---------- GNOME top bar ---------- */
.demo-cursor .topbar{position:absolute;top:0;left:0;right:0;height:34px;z-index:40;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:rgba(0,0,0,.45);backdrop-filter:blur(8px);color:#e9e9ec;font-size:12.5px;font-weight:600;}
.demo-cursor .topbar .tb-activities{padding:3px 10px;border-radius:7px;}
.demo-cursor .topbar .tb-clock{position:absolute;left:50%;transform:translateX(-50%);color:#fff;font-weight:600;}
.demo-cursor .topbar .tb-status{display:flex;align-items:center;gap:11px;}
.demo-cursor .topbar .tb-status svg{width:15px;height:15px;display:block;color:#e9e9ec;}

/* ---------- in-desktop demo controls ---------- */
.demo-cursor .controls{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:9px 14px;background:#0d0f17;border-bottom:1px solid #242a3d;}
.demo-cursor .ctl-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.demo-cursor .ctl-label{font-size:10.5px;color:#9aa0b6;font-weight:700;text-transform:uppercase;letter-spacing:.05em;}
.demo-cursor .toggle{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:#d4d8ec;cursor:pointer;user-select:none;}
.demo-cursor .toggle input{accent-color:#7d87ff;width:14px;height:14px;cursor:pointer;margin:0;}
.demo-cursor .btn-animate{appearance:none;border:0;cursor:pointer;font:inherit;font-weight:700;font-size:13px;color:#fff;background:var(--accent);padding:8px 15px;border-radius:9px;display:flex;align-items:center;gap:7px;box-shadow:0 6px 16px -8px var(--accent);transition:transform .12s ease, opacity .2s ease, filter .15s;}
.demo-cursor .btn-animate:hover{filter:brightness(1.08);transform:translateY(-1px);}
.demo-cursor .btn-animate:disabled{opacity:.5;cursor:default;transform:none;}
.demo-cursor .btn-animate svg{width:13px;height:13px;}
.demo-cursor .status{display:none;}

/* ---------- generic window (Adwaita) ---------- */
.demo-cursor .win{position:absolute;display:none;flex-direction:column;background:var(--win-bg);border-radius:13px;overflow:hidden;color:var(--win-text);box-shadow:0 24px 60px -18px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.18);}
.demo-cursor .win.lifted{box-shadow:0 46px 110px -22px rgba(0,0,0,.75), 0 0 0 1px rgba(0,0,0,.22);}
.demo-cursor .win.tween{transition:left .28s cubic-bezier(.2,.8,.2,1), top .28s cubic-bezier(.2,.8,.2,1), width .28s cubic-bezier(.2,.8,.2,1), height .28s cubic-bezier(.2,.8,.2,1), opacity .22s ease, transform .28s cubic-bezier(.2,.8,.2,1);}

.demo-cursor .titlebar{position:relative;display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:9px 10px;background:var(--win-head);border-bottom:1px solid #dcdce0;cursor:grab;touch-action:none;flex:0 0 auto;}
.demo-cursor .win.lifted .titlebar,.demo-cursor .win.dragging .titlebar{cursor:grabbing;}
.demo-cursor .win.maximized .titlebar{cursor:default;}
.demo-cursor .win-title{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:7px;white-space:nowrap;font-size:13px;font-weight:700;color:var(--win-text);}
.demo-cursor .win-title svg{width:15px;height:15px;}
.demo-cursor .win-controls{display:flex;gap:8px;z-index:1;}
.demo-cursor .win-ctl{appearance:none;border:0;background:#d7d7db;width:25px;height:25px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:#3a393f;transition:background .12s, color .12s, transform .1s;}
.demo-cursor .win-ctl:hover{background:#cbcbd0;}
.demo-cursor .win-ctl.close:hover{background:var(--danger);color:#fff;}
.demo-cursor .win-ctl.pressed{transform:scale(.84);}
.demo-cursor .win-ctl svg{width:12px;height:12px;}

/* explorer body */
.demo-cursor .explorer-body{display:flex;flex:1;min-height:0;}
.demo-cursor .sidebar{width:150px;flex:0 0 auto;background:#f3f3f4;border-right:1px solid #e3e3e6;padding:12px 9px;font-size:12px;color:var(--win-dim);display:flex;flex-direction:column;gap:3px;}
.demo-cursor .sidebar .sb-head{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:#9a989f;margin:6px 6px 4px;}
.demo-cursor .sidebar .sb-item{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:8px;}
.demo-cursor .sidebar .sb-item.active{background:var(--accent);color:#fff;font-weight:600;}
.demo-cursor .folder-grid{flex:1;min-height:0;overflow:auto;padding:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));grid-auto-rows:max-content;gap:10px;align-content:start;background:var(--win-bg);}
.demo-cursor .folder{display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 6px 9px;border-radius:10px;font-size:12px;color:var(--win-text);cursor:default;border:1px solid transparent;transition:background .12s, border-color .12s, opacity .25s, transform .25s;text-align:center;}
.demo-cursor .folder:hover{background:#eef0f3;}
.demo-cursor .folder.pressed,.demo-cursor .folder.selected{background:rgba(53,132,228,.16);border-color:rgba(53,132,228,.5);}
.demo-cursor .folder .fi{width:46px;height:38px;display:grid;place-items:center;}
.demo-cursor .folder .fi svg{width:42px;height:34px;}
.demo-cursor .folder.deleted{opacity:0;transform:scale(.7);pointer-events:none;}

/* confirm dialog (Adwaita AlertDialog) */
.demo-cursor .modal{width:380px;}
.demo-cursor .modal .titlebar{background:var(--win-bg);border-bottom:0;justify-content:flex-end;padding:8px 8px 0;}
.demo-cursor .modal-body{padding:4px 26px 22px;text-align:center;}
.demo-cursor .modal-body .ic{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;margin:0 auto 12px;background:rgba(224,27,36,.12);color:var(--danger);}
.demo-cursor .modal-body .ic svg{width:24px;height:24px;}
.demo-cursor .modal-body h3{margin:0 0 8px;font-size:16px;font-weight:700;color:var(--win-text);}
.demo-cursor .modal-body p{margin:0;font-size:13px;color:var(--win-dim);line-height:1.5;}
.demo-cursor .modal-body p b{color:var(--win-text);}
.demo-cursor .modal-actions{display:flex;gap:10px;margin-top:20px;}
.demo-cursor .ui-btn{flex:1;appearance:none;border:1px solid #d0d0d4;background:#fff;font:inherit;font-size:13px;font-weight:700;color:var(--win-text);padding:10px 16px;border-radius:9px;cursor:pointer;transition:transform .1s, background .15s, box-shadow .15s, border-color .15s;}
.demo-cursor .ui-btn.danger{background:var(--danger);border-color:var(--danger);color:#fff;box-shadow:0 6px 14px -6px rgba(224,27,36,.7);}
.demo-cursor .ui-btn.pressed{transform:translateY(1px) scale(.98);}
.demo-cursor .ui-btn.danger.pressed{filter:brightness(.92);}
.demo-cursor .ui-btn:not(.danger).pressed{background:#eef0f3;border-color:#bcbcc2;}

/* context menus (Adwaita popover) */
.demo-cursor .ctx-menu{position:absolute;z-index:55;display:none;min-width:184px;background:#fff;border:1px solid #dcdce0;border-radius:12px;padding:6px;box-shadow:0 18px 44px -12px rgba(0,0,0,.45), 0 0 0 1px rgba(0,0,0,.04);transform-origin:top left;opacity:0;transform:scale(.96);transition:opacity .12s ease, transform .12s ease;}
.demo-cursor .ctx-menu.in{opacity:1;transform:scale(1);}
.demo-cursor .ctx-item{display:flex;align-items:center;gap:11px;padding:8px 10px;border-radius:8px;font-size:12.5px;color:var(--win-text);cursor:default;}
.demo-cursor .ctx-item .ck{width:15px;height:15px;color:#7a7980;}
.demo-cursor .ctx-item .ck svg{width:15px;height:15px;}
.demo-cursor .ctx-item:hover{background:#eef0f3;}
.demo-cursor .ctx-item.danger{color:var(--danger);}
.demo-cursor .ctx-item.danger .ck{color:var(--danger);}
.demo-cursor .ctx-item.pressed{background:var(--accent);color:#fff;}
.demo-cursor .ctx-item.pressed .ck{color:#fff;}
.demo-cursor .ctx-sep{height:1px;background:#e8e8eb;margin:5px 6px;}

/* ---------- GNOME dock ---------- */
.demo-cursor .dock{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);height:60px;z-index:30;display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:18px;background:rgba(20,20,28,.5);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);box-shadow:0 14px 34px -14px rgba(0,0,0,.7);}
.demo-cursor .dock-app{position:relative;width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:rgba(255,255,255,.07);border:0;cursor:pointer;transition:transform .12s, background .15s;}
.demo-cursor .dock-app:hover{background:rgba(255,255,255,.16);transform:translateY(-2px);}
.demo-cursor .dock-app svg{width:26px;height:26px;display:block;}
.demo-cursor .dock-app.pressed{transform:scale(.88);background:rgba(255,255,255,.22);}
.demo-cursor .dock-app .run-dot{position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:#fff;opacity:0;transition:opacity .2s;}
.demo-cursor .dock-app.active .run-dot,.demo-cursor .dock-app.minimized .run-dot{opacity:1;}
.demo-cursor .dock-sep{width:1px;height:30px;background:rgba(255,255,255,.18);margin:0 3px;}

.demo-cursor .path-layer{position:absolute;inset:0;pointer-events:none;z-index:50;}
.demo-cursor .ripple{position:absolute;z-index:52;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid rgba(255,255,255,.9);pointer-events:none;animation:ripple .55s ease-out forwards;}
.demo-cursor .ripple.right{border-color:rgba(120,205,255,.95);}
@keyframes ripple{from{transform:scale(.4);opacity:.9;}to{transform:scale(3.4);opacity:0;}}
.demo-cursor .cursor{position:absolute;top:0;left:0;z-index:60;width:24px;height:24px;pointer-events:none;transform-origin:3px 3px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));will-change:transform;}
`;

export default function CursorDemo({ variant }: { variant: number }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = root.current!;
    let alive = true;
    let lastRaf = 0;
    const rafs = new Set<number>();
    const raf = (cb: FrameRequestCallback) => {
      const id = requestAnimationFrame((t) => {
        rafs.delete(id);
        cb(t);
      });
      rafs.add(id);
      lastRaf = id;
      return id;
    };

    const screen = r.querySelector("#screen") as HTMLElement;
    const cursor = r.querySelector("#cursor") as HTMLElement;
    const pathLayer = r.querySelector("#pathLayer") as unknown as SVGSVGElement;
    const statusEl = r.querySelector("#status") as HTMLElement;
    const animateBtn = r.querySelector("#animateBtn") as HTMLButtonElement;
    const showPathEl = r.querySelector("#showPath") as HTMLInputElement;
    const loopEl = r.querySelector("#loop") as HTMLInputElement;

    const filesIcon = r.querySelector("#filesIcon") as HTMLElement;
    const explorer = r.querySelector("#explorer") as any;
    const explorerBar = r.querySelector("#explorerBar") as HTMLElement;
    const explorerMin = r.querySelector("#explorerMin") as HTMLElement;
    const explorerMax = r.querySelector("#explorerMax") as HTMLElement;
    const explorerClose = r.querySelector("#explorerClose") as HTMLElement;
    const folderDocs = r.querySelector("#folderDocs") as HTMLElement;
    const folderMenu = r.querySelector("#folderMenu") as HTMLElement;
    const menuDelete = r.querySelector("#menuDelete") as HTMLElement;
    const confirmModal = r.querySelector("#confirmModal") as HTMLElement;
    const confirmBar = r.querySelector("#confirmBar") as HTMLElement;
    const confirmYes = r.querySelector("#confirmYes") as HTMLElement;
    const confirmNo = r.querySelector("#confirmNo") as HTMLElement;
    const taskItem = filesIcon; // the dock Files icon is also the running-app handle
    const taskMenu = r.querySelector("#taskMenu") as HTMLElement;
    const taskClose = r.querySelector("#taskClose") as HTMLElement;
    const taskRestore = r.querySelector("#taskRestore") as HTMLElement;

    const TOP = 34,
      DOCK = 88; // reserved top bar / dock bands

    const pos = { x: 80, y: 90 };
    let running = false;

    // ---- small helpers ---------------------------------------------------
    const sleep = (ms: number) =>
      new Promise<void>((res) => setTimeout(res, ms));
    const jitter = (base: number, spread: number) =>
      base + (Math.random() * 2 - 1) * spread;
    const rand = (min: number, max: number) =>
      min + Math.random() * (max - min);
    const clamp = (lo: number, hi: number, v: number) =>
      Math.max(lo, Math.min(hi, v));
    const raf2 = () => new Promise<void>((res) => raf(() => raf(() => res())));
    const status = (html: string) => {
      statusEl.innerHTML = html;
    };

    let cursorScale = 1,
      cursorDip = 0;
    function applyCursor() {
      cursor.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${cursorScale}) translate(0, ${cursorDip}px)`;
    }
    function place(x: number, y: number) {
      pos.x = x;
      pos.y = y;
      applyCursor();
    }

    // geometry, all screen-relative pixels
    function rectOf(el: Element) {
      const rc = el.getBoundingClientRect(),
        s = screen.getBoundingClientRect();
      return {
        x: rc.left - s.left,
        y: rc.top - s.top,
        w: rc.width,
        h: rc.height,
      };
    }
    function pointOf(el: Element, fx = 0.5, fy = 0.5) {
      const rc = rectOf(el);
      return { x: rc.x + rc.w * fx, y: rc.y + rc.h * fy };
    }
    const centerOf = (el: Element) => pointOf(el, 0.5, 0.5);
    function posOf(el: any) {
      return {
        x: parseFloat(el.style.left) || 0,
        y: parseFloat(el.style.top) || 0,
      };
    }
    function setPos(el: any, x: number, y: number) {
      el.style.left = x + "px";
      el.style.top = y + "px";
    }
    function clampPos(el: Element, x: number, y: number) {
      const rc = rectOf(el);
      const maxX = screen.clientWidth - rc.w - 6;
      const maxY = screen.clientHeight - DOCK - rc.h;
      return {
        x: clamp(6, Math.max(6, maxX), x),
        y: clamp(TOP + 6, Math.max(TOP + 6, maxY), y),
      };
    }
    function randomDestFor(el: Element) {
      const rc = rectOf(el);
      const maxX = Math.max(6, screen.clientWidth - rc.w - 6);
      const maxY = Math.max(TOP + 6, screen.clientHeight - DOCK - rc.h);
      return { x: rand(6, maxX), y: rand(TOP + 6, maxY) };
    }
    function farDestFor(el: Element) {
      const cur = posOf(el);
      let best = randomDestFor(el),
        bestD = -1;
      for (let i = 0; i < 10; i++) {
        const d = randomDestFor(el);
        const dist = Math.hypot(d.x - cur.x, d.y - cur.y);
        if (dist > bestD) {
          bestD = dist;
          best = d;
        }
      }
      return best;
    }

    // ===================================================================
    //  MOTION  —  shared helpers (defined once, reused by mt1..mt7)
    // ===================================================================
    function cubicBezier(p0: any, p1: any, p2: any, p3: any, t: number) {
      const u = 1 - t,
        uu = u * u,
        tt = t * t;
      const a = uu * u,
        b = 3 * uu * t,
        c = 3 * u * tt,
        d = tt * t;
      return {
        x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
        y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
      };
    }
    function makeEaser(x1: number, y1: number, x2: number, y2: number) {
      const cx = 3 * x1,
        bx = 3 * (x2 - x1) - cx,
        ax = 1 - cx - bx;
      const cy = 3 * y1,
        by = 3 * (y2 - y1) - cy,
        ay = 1 - cy - by;
      const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
      const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
      const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
      return (p: number) => {
        if (p <= 0) return 0;
        if (p >= 1) return 1;
        let t = p;
        for (let i = 0; i < 8; i++) {
          const x = sampleX(t) - p;
          if (Math.abs(x) < 1e-5) break;
          const dx = slopeX(t);
          if (Math.abs(dx) < 1e-6) break;
          t -= x / dx;
        }
        return sampleY(clamp(0, 1, t));
      };
    }
    const randomEaser = () =>
      makeEaser(rand(0.2, 0.5), rand(0, 0.12), rand(0.5, 0.8), rand(0.88, 1));
    const easeMinJerk = (t: number) => t * t * t * (t * (6 * t - 15) + 10);
    const quad = (p0: any, c: any, p1: any, t: number) => {
      const u = 1 - t;
      return {
        x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
        y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
      };
    };
    const on = (id: string) => {
      const e = r.querySelector("#" + id) as HTMLInputElement | null;
      return !!(e && e.checked);
    };
    function palmPivot() {
      const W = screen.clientWidth,
        H = screen.clientHeight;
      const handed = on("leftHand") ? "left" : "right";
      return handed === "left"
        ? { x: -W * 0.06, y: H * 1.28 }
        : { x: W * 1.06, y: H * 1.28 };
    }

    // ---- Stage 1: teleport ----
    function mt1(end: any, onFrame: any = null, _curveMul = 1) {
      pos.x = end.x;
      pos.y = end.y;
      applyCursor();
      if (onFrame) onFrame(pos);
      return Promise.resolve();
    }

    // ---- Stage 2: straight line, constant speed ----
    function mt2(end: any, onFrame: any = null, _curveMul = 1) {
      return new Promise<void>((resolve) => {
        const start = { x: pos.x, y: pos.y };
        const dx = end.x - start.x,
          dy = end.y - start.y;
        const dist = Math.hypot(dx, dy) || 1;
        const duration = dist / 0.85; // constant px/ms, no easing
        if (showPathEl.checked)
          addPathD(`M ${start.x} ${start.y} L ${end.x} ${end.y}`);
        const t0 = performance.now();
        (function frame(now: number) {
          let p = (now - t0) / duration;
          if (p > 1) p = 1;
          pos.x = start.x + dx * p;
          pos.y = start.y + dy * p;
          applyCursor();
          if (onFrame) onFrame(pos);
          if (p < 1) raf(frame);
          else resolve();
        })(performance.now());
      });
    }

    // ---- Stage 3: eased straight, min-jerk ----
    function mt3(end: any, onFrame: any = null, _curveMul = 1) {
      return new Promise<void>((resolve) => {
        const start = { x: pos.x, y: pos.y };
        const dx = end.x - start.x,
          dy = end.y - start.y;
        const dist = Math.hypot(dx, dy) || 1;
        const duration = Math.min(950, 320 + dist * 0.7);
        if (showPathEl.checked)
          addPathD(`M ${start.x} ${start.y} L ${end.x} ${end.y}`);
        const t0 = performance.now();
        (function frame(now: number) {
          let p = (now - t0) / duration;
          if (p > 1) p = 1;
          const e = easeMinJerk(p);
          pos.x = start.x + dx * e;
          pos.y = start.y + dy * e;
          applyCursor();
          if (onFrame) onFrame(pos);
          if (p < 1) raf(frame);
          else resolve();
        })(performance.now());
      });
    }

    // ---- Stage 4: eased quadratic curve, fixed bow ----
    function mt4(end: any, onFrame: any = null, curveMul = 1) {
      return new Promise<void>((resolve) => {
        const start = { x: pos.x, y: pos.y };
        const dx = end.x - start.x,
          dy = end.y - start.y;
        const dist = Math.hypot(dx, dy) || 1;
        const nx = -dy / dist,
          ny = dx / dist;
        const bow = dist * 0.22 * curveMul; // fixed fraction, one side, every move
        const c = {
          x: start.x + dx * 0.5 + nx * bow,
          y: start.y + dy * 0.5 + ny * bow,
        };
        const duration = Math.min(1050, 320 + dist * 0.75);
        if (showPathEl.checked)
          addPathD(`M ${start.x} ${start.y} Q ${c.x} ${c.y} ${end.x} ${end.y}`);
        const t0 = performance.now();
        (function frame(now: number) {
          let p = (now - t0) / duration;
          if (p > 1) p = 1;
          const pt = quad(start, c, end, easeMinJerk(p));
          pos.x = pt.x;
          pos.y = pt.y;
          applyCursor();
          if (onFrame) onFrame(pos);
          if (p < 1) raf(frame);
          else resolve();
        })(performance.now());
      });
    }

    // ---- Stage 5: cubic, randomised control points, |sin2θ| weighting ----
    function mt5(end: any, onFrame: any = null, curveMul = 1) {
      return new Promise<void>((resolve) => {
        const start = { x: pos.x, y: pos.y };
        const dx = end.x - start.x,
          dy = end.y - start.y;
        const dist = Math.hypot(dx, dy) || 1;
        const nx = -dy / dist,
          ny = dx / dist;

        const theta = Math.atan2(dy, dx);
        const diagness = Math.abs(Math.sin(2 * theta)); // 0 = cardinal, 1 = diagonal
        const dirWeight = (0.14 + 0.86 * diagness) * curveMul; // floor so it's never dead straight

        const primary = Math.random() < 0.5 ? -1 : 1;
        const ctrlAt = (frac: number) => {
          const sign = Math.random() < 0.25 ? -primary : primary;
          const mag = dist * rand(0.04, 0.26) * sign * dirWeight;
          return {
            x: start.x + dx * frac + nx * mag,
            y: start.y + dy * frac + ny * mag,
          };
        };
        const c1 = ctrlAt(rand(0.15, 0.4));
        const c2 = ctrlAt(rand(0.6, 0.85));

        const ease = randomEaser();
        const duration = Math.min(1250, (340 + dist * 0.8) * rand(0.8, 1.25));

        if (showPathEl.checked)
          addPathD(
            `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`,
          );

        const t0 = performance.now();
        (function frame(now: number) {
          let p = (now - t0) / duration;
          if (p > 1) p = 1;
          const pt = cubicBezier(start, c1, c2, end, ease(p));
          pos.x = pt.x;
          pos.y = pt.y;
          applyCursor();
          if (onFrame) onFrame(pos);
          if (p < 1) raf(frame);
          else resolve();
        })(performance.now());
      });
    }

    // ---- Stage 6: palm-pivot clothoid + randomise ----
    function mt6(end: any, onFrame: any = null, curveMul = 1) {
      return new Promise<void>((resolve) => {
        const start = { x: pos.x, y: pos.y };
        const dx = end.x - start.x,
          dy = end.y - start.y;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist,
          uy = dy / dist;

        const pv = palmPivot();
        const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        const aS = Math.atan2(start.y - pv.y, start.x - pv.x);
        const aE = Math.atan2(end.y - pv.y, end.x - pv.x);
        let dphi = aE - aS;
        while (dphi > Math.PI) dphi -= 2 * Math.PI;
        while (dphi < -Math.PI) dphi += 2 * Math.PI;
        const Rmid = Math.hypot(mid.x - pv.x, mid.y - pv.y) || 1;
        const sagitta = Rmid * (1 - Math.cos(dphi / 2)); // ~0 longitudinal, grows with lateral sweep

        let nx = -uy,
          ny = ux; // perpendicular to the move
        if (nx * (mid.x - pv.x) + ny * (mid.y - pv.y) < 0) {
          nx = -nx;
          ny = -ny;
        } // bulge away from wrist (concave toward it)

        // clothoid-like entry: control 1 near the line (straight start), control 2 carries the arch (late)
        const arch =
          Math.min(dist * 0.8, 2.2 * sagitta) * curveMul * rand(0.9, 1.1);
        const o1 = arch * rand(0.04, 0.16);
        const f1 = rand(0.28, 0.4),
          f2 = rand(0.64, 0.8);
        const c1 = {
          x: start.x + dx * f1 + nx * o1,
          y: start.y + dy * f1 + ny * o1,
        };
        const c2 = {
          x: start.x + dx * f2 + nx * arch,
          y: start.y + dy * f2 + ny * arch,
        };

        const ease = randomEaser();
        const duration = Math.min(1250, (340 + dist * 0.8) * rand(0.85, 1.2));

        if (showPathEl.checked)
          addPathD(
            `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`,
          );

        const t0 = performance.now();
        (function frame(now: number) {
          let p = (now - t0) / duration;
          if (p > 1) p = 1;
          const pt = cubicBezier(start, c1, c2, end, ease(p));
          pos.x = pt.x;
          pos.y = pt.y;
          applyCursor();
          if (onFrame) onFrame(pos);
          if (p < 1) raf(frame);
          else resolve();
        })(performance.now());
      });
    }

    // ---- Stage 7: composable, reads fx checkboxes live ----
    function mt7(end: any, onFrame: any = null, curveMul = 1) {
      return new Promise<void>((resolve) => {
        const start = { x: pos.x, y: pos.y };
        const dx = end.x - start.x,
          dy = end.y - start.y,
          dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist,
          uy = dy / dist;
        let nx = -uy,
          ny = ux;

        const useCurve = on("fxCurve"),
          useHanded = on("fxHanded"),
          useCloth = on("fxClothoid");
        const useRandom = on("fxRandom"),
          useEase = on("fxEase"),
          useWind = on("fxWind");

        // bow magnitude + direction
        let arch = 0;
        if (useCurve) {
          if (useHanded) {
            const pv = palmPivot();
            const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
            const aS = Math.atan2(start.y - pv.y, start.x - pv.x),
              aE = Math.atan2(end.y - pv.y, end.x - pv.x);
            let dphi = aE - aS;
            while (dphi > Math.PI) dphi -= 2 * Math.PI;
            while (dphi < -Math.PI) dphi += 2 * Math.PI;
            const R = Math.hypot(mid.x - pv.x, mid.y - pv.y) || 1;
            const sagitta = R * (1 - Math.cos(dphi / 2));
            if (nx * (mid.x - pv.x) + ny * (mid.y - pv.y) < 0) {
              nx = -nx;
              ny = -ny;
            }
            arch = Math.min(dist * 0.8, 2.2 * sagitta);
          } else {
            arch = dist * 0.22; // naive fixed bow, always the same side
          }
          if (useRandom) arch *= rand(0.82, 1.12);
          arch *= curveMul;
        }

        // control points
        let c1: any, c2: any;
        if (!useCurve) {
          c1 = { x: start.x + dx * 0.33, y: start.y + dy * 0.33 };
          c2 = { x: start.x + dx * 0.66, y: start.y + dy * 0.66 };
        } else if (useCloth) {
          // asymmetric: straight entry, late arch
          const o1 = arch * (useRandom ? rand(0.04, 0.16) : 0.1);
          const f1 = useRandom ? rand(0.28, 0.4) : 0.34,
            f2 = useRandom ? rand(0.64, 0.8) : 0.7;
          c1 = {
            x: start.x + dx * f1 + nx * o1,
            y: start.y + dy * f1 + ny * o1,
          };
          c2 = {
            x: start.x + dx * f2 + nx * arch,
            y: start.y + dy * f2 + ny * arch,
          };
        } else {
          // symmetric: constant-curvature arc
          const o = arch * 0.66;
          const f1 = useRandom ? rand(0.28, 0.4) : 0.33,
            f2 = useRandom ? rand(0.6, 0.72) : 0.66;
          c1 = { x: start.x + dx * f1 + nx * o, y: start.y + dy * f1 + ny * o };
          c2 = { x: start.x + dx * f2 + nx * o, y: start.y + dy * f2 + ny * o };
        }

        const ease = useEase
          ? useRandom
            ? randomEaser()
            : easeMinJerk
          : (t: number) => t;
        let duration = 340 + dist * 0.8;
        if (useRandom) duration *= rand(0.85, 1.2);
        duration = Math.min(1300, duration);

        if (showPathEl.checked)
          addPathD(
            `M ${start.x} ${start.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`,
          );

        let Wx = 0,
          Wy = 0;
        const WMAG = 7; // WindMouse-style tremor, tapered to 0 at the ends
        const t0 = performance.now();
        (function frame(now: number) {
          let p = (now - t0) / duration;
          if (p > 1) p = 1;
          const pt = cubicBezier(start, c1, c2, end, ease(p));
          if (useWind) {
            Wx = Wx / 1.732 + ((Math.random() * 2 - 1) * WMAG) / 2.236;
            Wy = Wy / 1.732 + ((Math.random() * 2 - 1) * WMAG) / 2.236;
            const taper = Math.sin(Math.PI * p);
            pos.x = pt.x + Wx * taper;
            pos.y = pt.y + Wy * taper;
          } else {
            pos.x = pt.x;
            pos.y = pt.y;
          }
          applyCursor();
          if (onFrame) onFrame(pos);
          if (p < 1) raf(frame);
          else {
            pos.x = end.x;
            pos.y = end.y;
            applyCursor();
            if (onFrame) onFrame(pos);
            resolve();
          }
        })(performance.now());
      });
    }

    const movers = [mt1, mt2, mt3, mt4, mt5, mt6, mt7];
    const moveTo = (end: any, onFrame: any = null, curveMul = 1) =>
      movers[variant - 1](end, onFrame, curveMul);
    // ===================================================================

    function tween(fn: (p: number) => void, ms: number) {
      return new Promise<void>((resolve) => {
        const t0 = performance.now();
        (function step(now: number) {
          let p = (now - t0) / ms;
          if (p > 1) p = 1;
          fn(p);
          p < 1 ? raf(step) : resolve();
        })(performance.now());
      });
    }
    const pressCursor = () =>
      tween((d) => {
        cursorScale = 1 - 0.12 * d;
        cursorDip = 2 * d;
        applyCursor();
      }, 90);
    const releaseCursor = () =>
      tween((d) => {
        cursorScale = 0.88 + 0.12 * d;
        cursorDip = 2 * (1 - d);
        applyCursor();
      }, 130).then(() => {
        cursorScale = 1;
        cursorDip = 0;
        applyCursor();
      });

    function spawnRipple(x: number, y: number, right = false) {
      const rip = document.createElement("div");
      rip.className = "ripple" + (right ? " right" : "");
      rip.style.left = x + "px";
      rip.style.top = y + "px";
      screen.appendChild(rip);
      setTimeout(() => rip.remove(), 600);
    }

    // ---- gesture primitives ---------------------------------------------
    async function tapGesture(
      el: Element | null,
      { right = false }: { right?: boolean } = {},
    ) {
      await sleep(jitter(120, 40));
      await pressCursor();
      if (el) el.classList.add("pressed");
      spawnRipple(pos.x, pos.y, right);
      await sleep(jitter(80, 25));
      if (el) el.classList.remove("pressed");
      await releaseCursor();
    }
    async function clickAt(point: any, el: Element | null) {
      await moveTo(point);
      await tapGesture(el);
    }
    async function click(el: Element) {
      await clickAt(centerOf(el), el);
    }
    async function doubleClickAt(point: any, el: Element | null) {
      await moveTo(point);
      await tapGesture(el);
      await sleep(jitter(110, 25));
      await tapGesture(el);
    }
    async function rightClickAt(point: any, el: Element | null) {
      await moveTo(point);
      await tapGesture(el, { right: true });
    }

    async function grabAndDrag(win: any, handle: Element, dest: any) {
      const hb = rectOf(handle);
      const grab = { x: hb.x + hb.w * rand(0.3, 0.6), y: hb.y + hb.h * 0.5 };
      await moveTo(grab);
      await sleep(jitter(130, 40));
      await pressCursor();
      win.classList.add("lifted");
      const wp = posOf(win);
      const offX = pos.x - wp.x,
        offY = pos.y - wp.y;
      const destCursor = { x: dest.x + offX, y: dest.y + offY };
      await moveTo(
        destCursor,
        (p: any) => {
          const c = clampPos(win, p.x - offX, p.y - offY);
          setPos(win, c.x, c.y);
        },
        0.6,
      );
      await sleep(jitter(90, 30));
      win.classList.remove("lifted");
      await releaseCursor();
    }

    // ---- path visualization ---------------------------------------------
    function addPathD(d: string) {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "rgba(255,255,255,.78)");
      path.setAttribute("stroke-width", "1.6");
      path.setAttribute("stroke-dasharray", "4 5");
      path.setAttribute("stroke-linecap", "round");
      pathLayer.appendChild(path);
      path.animate([{ opacity: 0.85 }, { opacity: 0 }], {
        duration: 1600,
        delay: 300,
        easing: "ease-out",
        fill: "forwards",
      }).onfinish = () => path.remove();
    }
    const syncLayer = () =>
      pathLayer.setAttribute(
        "viewBox",
        `0 0 ${screen.clientWidth} ${screen.clientHeight}`,
      );

    // ---- scene state ----------------------------------------------------
    function defaultExplorerGeom() {
      const W = screen.clientWidth,
        H = screen.clientHeight;
      return {
        left: W * 0.16,
        top: TOP + H * 0.07,
        width: W * 0.52,
        height: H * 0.52,
      };
    }
    function applyGeom(g: any) {
      explorer.style.left = g.left + "px";
      explorer.style.top = g.top + "px";
      explorer.style.width = g.width + "px";
      explorer.style.height = g.height + "px";
    }

    async function openExplorer() {
      applyGeom(defaultExplorerGeom());
      explorer.classList.remove("maximized", "minimized");
      explorer.style.display = "flex";
      explorer.style.transform = "scale(.96)";
      explorer.style.opacity = "0";
      taskItem.classList.add("active");
      explorer.classList.add("tween");
      await raf2();
      explorer.style.transform = "scale(1)";
      explorer.style.opacity = "1";
      await sleep(240);
      explorer.classList.remove("tween");
      explorer.style.transform = "";
    }

    async function maximizeExplorer(): Promise<void> {
      if (explorer.classList.contains("maximized")) return restoreExplorer();
      explorer._restore = {
        left: explorer.style.left,
        top: explorer.style.top,
        width: explorer.style.width,
        height: explorer.style.height,
      };
      explorer.classList.add("tween", "maximized");
      explorer.style.left = "8px";
      explorer.style.top = TOP + 6 + "px";
      explorer.style.width = screen.clientWidth - 16 + "px";
      explorer.style.height = screen.clientHeight - TOP - DOCK - 12 + "px";
      await sleep(300);
      explorer.classList.remove("tween");
    }
    async function restoreExplorer() {
      if (!explorer._restore) return;
      explorer.classList.add("tween");
      explorer.classList.remove("maximized");
      applyGeom({
        left: parseFloat(explorer._restore.left),
        top: parseFloat(explorer._restore.top),
        width: parseFloat(explorer._restore.width),
        height: parseFloat(explorer._restore.height),
      });
      await sleep(300);
      explorer.classList.remove("tween");
    }

    async function minimizeExplorer() {
      const ti = rectOf(taskItem),
        ex = rectOf(explorer);
      const dx = ti.x + ti.w / 2 - (ex.x + ex.w / 2);
      const dy = ti.y + ti.h / 2 - (ex.y + ex.h / 2);
      explorer.classList.add("tween", "minimized");
      explorer.style.transformOrigin = "center";
      explorer.style.transform = `translate(${dx}px, ${dy}px) scale(.12)`;
      explorer.style.opacity = "0";
      taskItem.classList.remove("active");
      taskItem.classList.add("minimized");
      await sleep(280);
      explorer.style.display = "none";
      explorer.classList.remove("tween");
      explorer.style.transform = "";
    }
    async function restoreFromTaskbar() {
      explorer.style.display = "flex";
      explorer.style.transform = "scale(.9)";
      explorer.style.opacity = "0";
      explorer.classList.add("tween");
      taskItem.classList.remove("minimized");
      taskItem.classList.add("active");
      await raf2();
      explorer.classList.remove("minimized");
      explorer.style.transform = "";
      explorer.style.opacity = "1";
      await sleep(240);
      explorer.classList.remove("tween");
    }

    async function closeExplorer() {
      if (explorer.style.display !== "none") {
        explorer.classList.add("tween");
        explorer.style.opacity = "0";
        explorer.style.transform = "scale(.96)";
        await sleep(180);
      }
      explorer.style.display = "none";
      explorer.classList.remove("tween", "maximized", "minimized", "lifted");
      explorer.style.transform = "";
      explorer.style.opacity = "";
      taskItem.classList.remove("active", "minimized");
    }

    async function showConfirm() {
      confirmModal.style.display = "flex";
      const rc = rectOf(confirmModal);
      setPos(
        confirmModal,
        (screen.clientWidth - rc.w) / 2,
        (screen.clientHeight - rc.h) / 2 - 10,
      );
      confirmModal.style.transform = "scale(.94)";
      confirmModal.style.opacity = "0";
      confirmModal.classList.add("tween");
      await raf2();
      confirmModal.style.transform = "scale(1)";
      confirmModal.style.opacity = "1";
      await sleep(200);
      confirmModal.classList.remove("tween");
      confirmModal.style.transform = "";
    }
    async function hideConfirm() {
      confirmModal.classList.add("tween");
      confirmModal.style.opacity = "0";
      confirmModal.style.transform = "scale(.96)";
      await sleep(160);
      confirmModal.style.display = "none";
      confirmModal.classList.remove("tween");
      confirmModal.style.transform = "";
      confirmModal.style.opacity = "";
    }

    function showMenu(menu: HTMLElement, x: number, y: number) {
      menu.style.display = "block";
      const rc = menu.getBoundingClientRect();
      const cx = Math.min(x, screen.clientWidth - rc.width - 6);
      const cy = Math.min(y, screen.clientHeight - DOCK - rc.height);
      menu.style.left = Math.max(6, cx) + "px";
      menu.style.top = Math.max(TOP + 6, cy) + "px";
      raf(() => menu.classList.add("in"));
    }
    function hideMenu(menu: HTMLElement) {
      menu.classList.remove("in");
      menu.style.display = "none";
    }

    function markDeleted(el: Element) {
      el.classList.add("deleted");
    }
    function resetScene() {
      hideMenu(folderMenu);
      hideMenu(taskMenu);
      confirmModal.style.display = "none";
      confirmModal.style.transform = "";
      confirmModal.style.opacity = "";
      explorer.style.display = "none";
      explorer.classList.remove("maximized", "minimized", "tween", "lifted");
      explorer.style.transform = "";
      explorer.style.opacity = "";
      explorer._restore = null;
      taskItem.classList.remove("active", "minimized");
      folderDocs.classList.remove("deleted", "selected");
    }

    // ---- the scripted showcase ------------------------------------------
    async function runOnce() {
      resetScene();
      await sleep(450);

      status("Open <b>Files</b>");
      await click(filesIcon);

      status("Launching <b>Files</b>");
      await openExplorer();
      await sleep(300);

      status("Double-click to <b>maximize</b>");
      await doubleClickAt(pointOf(explorerBar, rand(0.35, 0.6), 0.5), null);
      await maximizeExplorer();
      await sleep(280);

      status("Right-click <b>Documents</b>");
      await moveTo(centerOf(folderDocs));
      await sleep(jitter(120, 40));
      folderDocs.classList.add("selected");
      await pressCursor();
      folderDocs.classList.add("pressed");
      spawnRipple(pos.x, pos.y, true);
      await sleep(jitter(80, 25));
      folderDocs.classList.remove("pressed");
      await releaseCursor();
      showMenu(folderMenu, pos.x, pos.y);
      await sleep(380);

      status("Choose <b>Move to Trash</b>");
      await click(menuDelete);
      hideMenu(folderMenu);
      folderDocs.classList.remove("selected");
      await sleep(150);

      status("Confirmation appears");
      await showConfirm();
      await sleep(380);

      status("Drag the dialog away");
      await grabAndDrag(confirmModal, confirmBar, farDestFor(confirmModal));
      await sleep(250);

      const confirmDelete = Math.random() < 0.5;
      status(confirmDelete ? "Confirm <b>Delete</b>" : "Press <b>Cancel</b>");
      await click(confirmDelete ? confirmYes : confirmNo);
      await hideConfirm();
      if (confirmDelete) markDeleted(folderDocs);
      await sleep(320);

      status("<b>Minimize</b> the window");
      await click(explorerMin);
      await minimizeExplorer();
      await sleep(320);

      status("Right-click the dock icon");
      await rightClickAt(centerOf(taskItem), taskItem);
      showMenu(taskMenu, pos.x, pos.y);
      await sleep(400);

      status("Select <b>Quit</b>");
      await click(taskClose);
      hideMenu(taskMenu);
      await closeExplorer();

      status("Done.");
    }

    async function run() {
      if (running) return;
      running = true;
      animateBtn.disabled = true;
      syncLayer();
      do {
        await runOnce();
        if (!alive) break;
        if (loopEl.checked) await sleep(700);
      } while (loopEl.checked && running && alive);
      running = false;
      animateBtn.disabled = false;
    }
    animateBtn.addEventListener("click", run);

    // ---- manual interaction (when not running) --------------------------
    const onContextMenu = (e: Event) => e.preventDefault();
    screen.addEventListener("contextmenu", onContextMenu);

    filesIcon.addEventListener("click", () => {
      if (running) return;
      if (explorer.style.display === "none") openExplorer();
      else if (explorer.classList.contains("minimized")) restoreFromTaskbar();
    });
    explorerMax.addEventListener("click", () => {
      if (!running) maximizeExplorer();
    });
    explorerMin.addEventListener("click", () => {
      if (!running && explorer.style.display !== "none") minimizeExplorer();
    });
    explorerClose.addEventListener("click", () => {
      if (!running) closeExplorer();
    });
    explorerBar.addEventListener("dblclick", () => {
      if (!running) maximizeExplorer();
    });

    taskItem.addEventListener("contextmenu", () => {
      if (running) return;
      const p = pointOf(taskItem, 0.5, 0.2);
      showMenu(taskMenu, p.x, p.y);
    });
    taskClose.addEventListener("click", () => {
      if (running) return;
      hideMenu(taskMenu);
      closeExplorer();
    });
    taskRestore.addEventListener("click", () => {
      if (running) return;
      hideMenu(taskMenu);
      restoreFromTaskbar();
    });

    folderDocs.addEventListener("contextmenu", (e: MouseEvent) => {
      if (running || explorer.style.display === "none") return;
      const s = screen.getBoundingClientRect();
      showMenu(folderMenu, e.clientX - s.left, e.clientY - s.top);
    });
    menuDelete.addEventListener("click", () => {
      if (running) return;
      hideMenu(folderMenu);
      showConfirm();
    });
    confirmYes.addEventListener("click", () => {
      if (running) return;
      markDeleted(folderDocs);
      hideConfirm();
    });
    confirmNo.addEventListener("click", () => {
      if (running) return;
      hideConfirm();
    });
    const confirmX = r.querySelector("#confirmX") as HTMLElement;
    confirmX.addEventListener("click", () => {
      if (!running) hideConfirm();
    });

    // dismiss menus on any outside click
    screen.addEventListener("pointerdown", (e: PointerEvent) => {
      const t = e.target as Element;
      if (!t.closest("#folderMenu")) hideMenu(folderMenu);
      if (!t.closest("#taskMenu") && !taskItem.contains(t)) hideMenu(taskMenu);
    });

    // ---- manual window dragging (delegated to any .titlebar) ------------
    let manual: any = null;
    screen.addEventListener("pointerdown", (e: PointerEvent) => {
      if (running) return;
      const t = e.target as Element;
      const bar = t.closest(".titlebar");
      if (!bar || t.closest(".win-controls")) return;
      const win = bar.closest(".win") as any;
      if (
        !win ||
        win.classList.contains("maximized") ||
        win.style.display === "none"
      )
        return;
      const s = screen.getBoundingClientRect();
      const wp = posOf(win);
      manual = {
        win,
        offX: e.clientX - s.left - wp.x,
        offY: e.clientY - s.top - wp.y,
      };
      win.classList.add("dragging");
      e.preventDefault();
    });
    const onPointerMove = (e: PointerEvent) => {
      if (!manual) return;
      const s = screen.getBoundingClientRect();
      const c = clampPos(
        manual.win,
        e.clientX - s.left - manual.offX,
        e.clientY - s.top - manual.offY,
      );
      setPos(manual.win, c.x, c.y);
    };
    const onPointerUp = () => {
      if (manual) {
        manual.win.classList.remove("dragging");
        manual = null;
      }
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      syncLayer();
      [explorer, confirmModal].forEach((w: any) => {
        if (w.style.display !== "none" && !w.classList.contains("maximized")) {
          const c = clampPos(w, posOf(w).x, posOf(w).y);
          setPos(w, c.x, c.y);
        }
      });
    };
    window.addEventListener("resize", onResize);

    // ---- leftHand wiring (variants 6 & 7 expose the toggle) -------------
    // palmPivot() reads the #leftHand checkbox live, so no extra state needed.

    // ---- init -----------------------------------------------------------
    const clockTimer = 0;
    function init() {
      syncLayer();
      resetScene();
      place(screen.clientWidth * 0.12, screen.clientHeight * 0.62);
      const now = new Date();
      const clk = r.querySelector("#clk") as HTMLElement;
      clk.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    raf(init);

    return () => {
      alive = false;
      running = false;
      cancelAnimationFrame(lastRaf);
      rafs.forEach((id) => cancelAnimationFrame(id));
      rafs.clear();
      if (clockTimer) clearTimeout(clockTimer);
      animateBtn.removeEventListener("click", run);
      screen.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, [variant]);

  return (
    <div className="demo demo-cursor" ref={root}>
      <style>{CSS}</style>

      <div className="controls">
        {variant === 7 ? (
          <>
            <div className="ctl-row">
              <button className="btn-animate" id="animateBtn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>{" "}
                Run
              </button>
              <label className="toggle">
                <input type="checkbox" id="showPath" defaultChecked /> Show path
              </label>
              <label className="toggle">
                <input type="checkbox" id="loop" /> Loop
              </label>
            </div>
            <div className="ctl-row">
              <span className="ctl-label">Layers</span>
              <label className="toggle">
                <input type="checkbox" id="fxEase" defaultChecked /> Easing
              </label>
              <label className="toggle">
                <input type="checkbox" id="fxCurve" defaultChecked /> Curve
              </label>
              <label className="toggle">
                <input type="checkbox" id="fxHanded" defaultChecked />{" "}
                Handedness
              </label>
              <label className="toggle">
                <input type="checkbox" id="fxClothoid" defaultChecked />{" "}
                Clothoid entry
              </label>
              <label className="toggle">
                <input type="checkbox" id="fxWind" /> Wind tremor
              </label>
              <label className="toggle">
                <input type="checkbox" id="fxRandom" defaultChecked /> Randomise
              </label>
              <label className="toggle">
                <input type="checkbox" id="leftHand" /> Left-handed
              </label>
            </div>
          </>
        ) : (
          <div className="ctl-row">
            <button className="btn-animate" id="animateBtn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>{" "}
              Run
            </button>
            <label className="toggle">
              <input type="checkbox" id="showPath" defaultChecked /> Show path
            </label>
            <label className="toggle">
              <input type="checkbox" id="loop" /> Loop
            </label>
            {variant >= 6 && (
              <label className="toggle">
                <input type="checkbox" id="leftHand" /> Left-handed
              </label>
            )}
          </div>
        )}
        <span className="status" id="status">
          Idle
        </span>
      </div>

      <div className="screen" id="screen">
        {/* GNOME top bar */}
        <div className="topbar">
          <div className="tb-activities">Activities</div>
          <div className="tb-clock" id="clk">
            14:55
          </div>
          <div className="tb-status">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M12 20h.01" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M11 5 6 9H3v6h3l5 4z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="2" y="8" width="17" height="8" rx="2" />
              <path d="M22 11v2" />
            </svg>
          </div>
        </div>

        {/* explorer window */}
        <section className="win" id="explorer">
          <div className="titlebar" id="explorerBar">
            <span className="win-title">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5566c4"
                strokeWidth="1.8"
              >
                <path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H3z" />
              </svg>
              Home
            </span>
            <div className="win-controls">
              <button className="win-ctl min" id="explorerMin" title="Minimize">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M5 12h14" />
                </svg>
              </button>
              <button className="win-ctl max" id="explorerMax" title="Maximize">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
              <button
                className="win-ctl close"
                id="explorerClose"
                title="Close"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </div>
          <div className="explorer-body">
            <aside className="sidebar">
              <div className="sb-head">Places</div>
              <div className="sb-item active">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M3 10 12 3l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
                </svg>
                Home
              </div>
              <div className="sb-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M4 5h7l2 2h7v11H4z" />
                </svg>
                Desktop
              </div>
              <div className="sb-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" />
                </svg>
                Downloads
              </div>
            </aside>
            <div className="folder-grid">
              <div className="folder" id="folderDocs">
                <span className="fi">
                  <svg
                    viewBox="0 0 24 24"
                    fill="#9bb6ff"
                    stroke="#5e7ce0"
                    strokeWidth="1.2"
                  >
                    <path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H3z" />
                  </svg>
                </span>
                Documents
              </div>
              <div className="folder">
                <span className="fi">
                  <svg
                    viewBox="0 0 24 24"
                    fill="#9bb6ff"
                    stroke="#5e7ce0"
                    strokeWidth="1.2"
                  >
                    <path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H3z" />
                  </svg>
                </span>
                Pictures
              </div>
              <div className="folder">
                <span className="fi">
                  <svg
                    viewBox="0 0 24 24"
                    fill="#9bb6ff"
                    stroke="#5e7ce0"
                    strokeWidth="1.2"
                  >
                    <path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H3z" />
                  </svg>
                </span>
                Projects
              </div>
              <div className="folder">
                <span className="fi">
                  <svg
                    viewBox="0 0 24 24"
                    fill="#fff"
                    stroke="#9aa3bd"
                    strokeWidth="1.2"
                  >
                    <path d="M6 3h8l4 4v14H6z" />
                    <path d="M14 3v4h4" />
                  </svg>
                </span>
                notes.txt
              </div>
              <div className="folder">
                <span className="fi">
                  <svg
                    viewBox="0 0 24 24"
                    fill="#fff"
                    stroke="#9aa3bd"
                    strokeWidth="1.2"
                  >
                    <path d="M6 3h8l4 4v14H6z" />
                    <path d="M14 3v4h4" />
                  </svg>
                </span>
                budget.xlsx
              </div>
            </div>
          </div>
        </section>

        {/* confirm dialog */}
        <section className="win modal" id="confirmModal">
          <div className="titlebar" id="confirmBar">
            <div className="win-controls">
              <button className="win-ctl close" id="confirmX" title="Close">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </div>
          <div className="modal-body">
            <div className="ic">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v4m0 4h.01M10.3 4l-8 14a1.5 1.5 0 0 0 1.3 2.2h16.8A1.5 1.5 0 0 0 21.7 18l-8-14a1.5 1.5 0 0 0-2.6 0z" />
              </svg>
            </div>
            <h3>Permanently delete “Documents”?</h3>
            <p>
              This folder and its contents will be deleted forever. This action
              cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="ui-btn" id="confirmNo">
                Cancel
              </button>
              <button className="ui-btn danger" id="confirmYes">
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* context menus */}
        <div className="ctx-menu" id="folderMenu">
          <div className="ctx-item">
            <span className="ck">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H3z" />
              </svg>
            </span>
            Open
          </div>
          <div className="ctx-item">
            <span className="ck">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M4 20h4l10-10-4-4L4 16z" />
              </svg>
            </span>
            Rename…
          </div>
          <div className="ctx-sep"></div>
          <div className="ctx-item danger" id="menuDelete">
            <span className="ck">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M5 7h14M9 7V5h6v2m-9 0 1 13h8l1-13" />
              </svg>
            </span>
            Move to Trash
          </div>
        </div>

        <div className="ctx-menu" id="taskMenu">
          <div className="ctx-item" id="taskRestore">
            <span className="ck">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            </span>
            Show window
          </div>
          <div className="ctx-sep"></div>
          <div className="ctx-item danger" id="taskClose">
            <span className="ck">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </span>
            Quit
          </div>
        </div>

        {/* dock */}
        <div className="dock">
          <button className="dock-app" id="filesIcon" aria-label="Files">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9fc0ff"
              strokeWidth="1.7"
            >
              <path d="M3 7h6l2 2h10v9a1 1 0 0 1-1 1H3z" />
            </svg>
            <span className="run-dot"></span>
          </button>
          <button className="dock-app" aria-label="Text Editor">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffd07a"
              strokeWidth="1.7"
            >
              <path d="M6 3h8l4 4v14H6z" />
              <path d="M14 3v4h4" />
              <path d="M9 13h6M9 16h6" />
            </svg>
          </button>
          <button className="dock-app" aria-label="Terminal">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9be59b"
              strokeWidth="1.7"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="m7 9 3 3-3 3M13 15h4" />
            </svg>
          </button>
          <button className="dock-app" aria-label="Web">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9fd0ff"
              strokeWidth="1.7"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
          </button>
          <span className="dock-sep"></span>
          <button className="dock-app" aria-label="Show Apps">
            <svg viewBox="0 0 24 24" fill="#cfd6ff">
              <circle cx="6" cy="6" r="2" />
              <circle cx="12" cy="6" r="2" />
              <circle cx="18" cy="6" r="2" />
              <circle cx="6" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="18" cy="12" r="2" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="12" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
          </button>
        </div>

        <svg
          className="path-layer"
          id="pathLayer"
          preserveAspectRatio="none"
        ></svg>

        <svg className="cursor" id="cursor" viewBox="0 0 24 24">
          <path
            d="M3 2 L3 19 L8 14.5 L11 21 L14 19.5 L11 13 L17.5 13 Z"
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
