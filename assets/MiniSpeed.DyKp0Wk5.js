import{j as e}from"./jsx-runtime.u17CrQMm.js";import{r as p}from"./index.CO9X3OiW.js";const g=`
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
`;function j(){const c=p.useRef(null);return p.useEffect(()=>{const a=c.current,m=a.querySelector(".track"),f=a.querySelector(".cur"),x=a.querySelector(".speed"),u=a.querySelector(".read");let t=0,r=1,s=null,o=0;function l(i){s===null&&(s=i);const h=Math.min(.05,(i-s)/1e3);s=i;const n=+x.value,d=Math.max(1,m.clientWidth-22);t+=n*h*r,t>=d&&(t=d,r=-1),t<=0&&(t=0,r=1),f.style.transform=`translateX(${t}px)`,u.innerHTML=`v = <b>${n}</b> px/s &middot; crosses in <b>${(d/n).toFixed(2)}</b> s`,o=requestAnimationFrame(l)}return o=requestAnimationFrame(l),()=>cancelAnimationFrame(o)},[]),e.jsxs("div",{className:"demo demo-speed",ref:c,children:[e.jsx("style",{children:g}),e.jsxs("p",{className:"caption",children:["Linear motion: the cursor covers equal distance every frame. Speed only changes ",e.jsx("b",{children:"how long the trip takes"})," — ",e.jsx("code",{children:"duration = distance ÷ speed"})," — never the shape of it. Drag the slider and watch it lurch off and stop dead at each end."]}),e.jsx("div",{className:"stage",children:e.jsxs("div",{className:"track",children:[e.jsx("span",{className:"tick",style:{left:0}}),e.jsx("span",{className:"tick",style:{right:0}}),e.jsx("svg",{className:"cur",viewBox:"0 0 24 24",children:e.jsx("path",{d:"M3 2 L3 19 L8 14.5 L11 21 L14 19.5 L11 13 L17.5 13 Z",fill:"#ffffff",stroke:"#1a1a1a",strokeWidth:"1.3",strokeLinejoin:"round"})})]})}),e.jsxs("div",{className:"row",children:[e.jsxs("label",{children:["Speed ",e.jsx("input",{className:"speed",type:"range",min:150,max:1600,defaultValue:600})]}),e.jsx("span",{className:"read"})]})]})}export{j as default};
