import { VERSION_COLOR } from "./data";

const CSS = `
.ng-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:6px 0 18px}
.ng-cards a{display:block;border:1px solid var(--line);border-radius:12px;padding:16px;text-decoration:none;color:inherit;background:var(--btn-bg);transition:transform .15s ease,box-shadow .15s ease;border-top-width:4px}
.ng-cards a:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(0,0,0,.12);text-decoration:none}
.ng-cards .name{font-size:1.05rem;font-weight:700;color:var(--fg-strong);margin-bottom:2px}
.ng-cards .status{font-size:0.74rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--muted);margin-bottom:10px}
.ng-cards .desc{font-size:0.88rem;color:var(--fg);line-height:1.5}
@media (max-width:700px){.ng-cards{grid-template-columns:1fr}}
`;

const CARDS = [
  {
    v: 22 as const,
    name: "Node 22 \u201cJod\u201d",
    status: "LTS",
    desc: "The interoperability release. ESM/CJS coexistence, a global WebSocket client, stable watch mode, and the start of built-in TypeScript.",
    href: "#node-22",
  },
  {
    v: 24 as const,
    name: "Node 24 \u201cKrypton\u201d",
    status: "Latest LTS \u00b7 default choice",
    desc: "The consolidation release. npm 11, URLPattern, a better AsyncLocalStorage, and stable built-in TypeScript from 24.12.",
    href: "#node-24",
  },
  {
    v: 26 as const,
    name: "Node 26",
    status: "Current \u00b7 LTS \u2248 Oct 2026",
    desc: "The modernisation release. Temporal by default, runtime permission dropping, direct SEA builds, and the biggest pile of removals.",
    href: "#node-26",
  },
];

export default function VersionCards() {
  return (
    <div className="ng-cards">
      <style>{CSS}</style>
      {CARDS.map((c) => (
        <a
          key={c.v}
          href={c.href}
          style={{ borderTopColor: VERSION_COLOR[c.v] }}
        >
          <div className="name">{c.name}</div>
          <div className="status">{c.status}</div>
          <div className="desc">{c.desc}</div>
        </a>
      ))}
    </div>
  );
}
