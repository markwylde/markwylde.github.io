import { BASE_CSS, C, Rich } from "./bits";

type Item = {
  when: string;
  title: string;
  body: string;
  who?: keyof typeof C;
  rule?: string;
};

const CSS = `
.bl-vt{list-style:none;margin:0;padding:0;position:relative}
.bl-vt li{display:grid;grid-template-columns:72px 24px 1fr;gap:0 6px;margin:0;padding:0 0 16px;position:relative}
.bl-vt li::before{content:"";position:absolute;left:89px;top:10px;bottom:-10px;width:2px;background:var(--line)}
.bl-vt li:last-child::before{display:none}
.bl-vt .when{font-size:.74rem;color:var(--muted);text-align:right;padding-top:3px;font-variant-numeric:tabular-nums;line-height:1.3}
.bl-vt .dot{width:12px;height:12px;border-radius:50%;margin:4px 0 0 6px;background:var(--c);box-shadow:0 0 0 3px var(--btn-bg);position:relative;z-index:1}
.bl-vt .t{font-weight:700;color:var(--fg-strong);font-size:.92rem}
.bl-vt .b{font-size:.86rem;line-height:1.55;padding-top:2px}
.bl-vt .rule{display:inline-block;margin-top:8px;font-size:.78rem;padding:3px 9px;border-radius:6px;border:1px dashed var(--c);color:var(--fg)}
.bl-vt .rule::before{content:"New rule: ";font-weight:700;color:var(--c)}
@media (max-width:560px){.bl-vt li{grid-template-columns:52px 24px 1fr}.bl-vt li::before{left:69px}}
`;

export default function VTimeline({ items }: { items: Item[] }) {
  return (
    <div className="demo bl-x">
      <style>{BASE_CSS + CSS}</style>
      <ol className="bl-vt">
        {items.map((it) => (
          <li
            key={it.when + it.title}
            style={{ ["--c" as string]: C[it.who ?? "claude"] }}
          >
            <span className="when">{it.when}</span>
            <span className="dot" />
            <div>
              <div className="t">
                <Rich text={it.title} />
              </div>
              <p className="b">
                <Rich text={it.body} />
              </p>
              {it.rule && (
                <span className="rule">
                  <Rich text={it.rule} />
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
