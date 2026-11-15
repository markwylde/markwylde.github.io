import type { ReactNode } from "react";

// Shared colours for the Bulletin post. Blue = DeepSeek, teal = Codex,
// orange = Claude, matching the change timeline.
export const C = {
  deepseek: "#5b7fe8",
  codex: "#2f9e8b",
  claude: "#e0915a",
  me: "#9aa0b6",
  p1: "#d9485f",
  p2: "#f0a04f",
  good: "#2f9e6b",
  bad: "#d9485f",
  warn: "#c98a1a",
};

// Render `code` spans inside a plain string.
export function Rich({ text }: { text: string }): ReactNode {
  const parts = text.split("`");
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: static split
      <code key={i}>{p}</code>
    ) : (
      p
    ),
  );
}

export const BASE_CSS = `
.blog-content .demo.bl-x{margin:1.25rem 0 1.75rem;line-height:1.5}
.blog-content .tool-section > .demo.bl-x:last-child,.blog-content .tool-section > astro-island:last-child > .demo.bl-x{margin-bottom:0}
.blog-content .demo.bl-x :is(h1,h2,h3,h4,h5,h6,p,ul,ol,li,figure){margin:0}
.blog-content .demo.bl-x :is(ul,ol){padding:0}
.blog-content .demo.bl-x :is(h4,h5){line-height:1.3}
.blog-content .demo.bl-x code{font-family:var(--font-mono,ui-monospace,monospace);font-size:.86em;color:var(--code-fg);background:var(--code-bg);border:none;padding:1px 5px;border-radius:4px;overflow-wrap:anywhere}
`;
