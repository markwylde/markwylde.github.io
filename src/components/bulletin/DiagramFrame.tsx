type Props = { name: string; title: string; height?: number };

const CSS = `
.bl-df{display:flex;flex-direction:column;gap:6px;margin:1.25rem 0}
.bl-df iframe{width:100%;border:1px solid var(--line);border-radius:10px;display:block}
.bl-df .cap{display:flex;justify-content:space-between;gap:10px;font-size:.78rem;color:var(--muted)}
.bl-df .cap a{color:inherit}
`;

export default function DiagramFrame({ name, title, height = 560 }: Props) {
  const src = `/bulletin-part-1/diagrams/${name}.html`;
  return (
    <div className="demo bl-df">
      <style>{CSS}</style>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        style={{ height }}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
      <div className="cap">
        <span>{title}</span>
        <a href={src} target="_blank" rel="noreferrer">
          Open full screen
        </a>
      </div>
    </div>
  );
}
