import { BASE_CSS, C, Rich } from "./bits";

type Card = {
  title: string;
  body: string;
  stat?: string;
  statLabel?: string;
  tone?: keyof typeof C;
};

const CSS = `
.bl-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr));gap:12px}
.bl-cards .cd{border:1px solid var(--line);border-left:4px solid var(--c);border-radius:8px;padding:14px 18px;background:var(--btn-bg);display:flex;flex-direction:column;gap:6px}
.bl-cards .st{display:flex;align-items:baseline;gap:6px}
.bl-cards .st b{font-size:1.4rem;line-height:1.1;color:var(--c);font-variant-numeric:tabular-nums}
.bl-cards .st small{font-size:.72rem;color:var(--muted)}
.bl-cards .tt{font-weight:700;color:var(--fg-strong);font-size:.9rem;line-height:1.35}
.bl-cards .bd{font-size:.86rem;line-height:1.55}
`;

export default function Cards({ items }: { items: Card[] }) {
  return (
    <div className="demo bl-x bl-cards">
      <style>{BASE_CSS + CSS}</style>
      {items.map((c) => (
        <div
          className="cd"
          key={c.title}
          style={{ ["--c" as string]: C[c.tone ?? "warn"] }}
        >
          {c.stat && (
            <div className="st">
              <b>{c.stat}</b>
              {c.statLabel && (
                <small>
                  <Rich text={c.statLabel} />
                </small>
              )}
            </div>
          )}
          <div className="tt">
            <Rich text={c.title} />
          </div>
          <p className="bd">
            <Rich text={c.body} />
          </p>
        </div>
      ))}
    </div>
  );
}
