import { BASE_CSS, C } from "./bits";

const ROLES = [
  {
    who: "Claude Opus 5.5",
    via: "Claude Code",
    role: "Planner and orchestrator",
    color: C.claude,
    did: "Wrote the specs with me, built the harness that drove DeepSeek, read every review, decided what blocked a merge and wrote the fix prompts.",
    nums: [
      ["~790M", "tokens"],
      ["107", "/loop wake-ups"],
    ],
  },
  {
    who: "DeepSeek Flash",
    via: "opencode",
    role: "Implementer",
    color: C.deepseek,
    did: "Wrote the code, ran the tests, ticked tasks and committed, one task at a time.",
    nums: [
      ["9.96B", "tokens"],
      ["~430", "commits"],
    ],
  },
  {
    who: "Codex",
    via: "codex exec, GPT models",
    role: "Reviewer",
    color: C.codex,
    did: "After every round of work, read the diff against the specs and reported P1 and P2 findings.",
    nums: [
      ["145", "reviews"],
      ["591", "findings"],
    ],
  },
];

const CSS = `
.bl-who{display:flex;flex-direction:column;gap:16px}
.bl-who .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:12px}
.bl-who .card{border:1px solid var(--line);border-top:4px solid var(--c);border-radius:10px;padding:16px 18px;background:var(--btn-bg);display:flex;flex-direction:column;gap:10px}
.bl-who .role{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--c)}
.bl-who h4{font-size:1.1rem;color:var(--fg-strong)}
.bl-who .via{display:block;font-size:.76rem;color:var(--muted);margin-top:2px}
.bl-who p{font-size:.86rem;line-height:1.55}
.bl-who .nums{display:flex;gap:24px;margin-top:auto;padding-top:12px;border-top:1px solid var(--line)}
.bl-who .nums b{display:block;font-size:1.15rem;color:var(--fg-strong);font-variant-numeric:tabular-nums}
.bl-who .nums small{display:block;font-size:.72rem;color:var(--muted);margin-top:2px}
.bl-who .flow{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;font-size:.78rem;color:var(--muted)}
.bl-who .flow span.n{padding:3px 10px;border-radius:999px;border:1px solid var(--c);color:var(--c);font-weight:600}
`;

export default function WhoDidWhat() {
  return (
    <div className="demo bl-x bl-who">
      <style>{BASE_CSS + CSS}</style>
      <div className="cards">
        {ROLES.map((r) => (
          <div
            className="card"
            key={r.who}
            style={{ ["--c" as string]: r.color }}
          >
            <span className="role">{r.role}</span>
            <div>
              <h4>{r.who}</h4>
              <span className="via">{r.via}</span>
            </div>
            <p>{r.did}</p>
            <div className="nums">
              {r.nums.map(([v, k]) => (
                <div key={k}>
                  <b>{v}</b>
                  <small>{k}</small>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flow">
        <span className="n" style={{ ["--c" as string]: C.claude }}>
          Claude
        </span>
        prompt →
        <span className="n" style={{ ["--c" as string]: C.deepseek }}>
          DeepSeek
        </span>
        diff →
        <span className="n" style={{ ["--c" as string]: C.codex }}>
          Codex
        </span>
        findings →
        <span className="n" style={{ ["--c" as string]: C.claude }}>
          Claude
        </span>
        … until clean, then merge
      </div>
    </div>
  );
}
