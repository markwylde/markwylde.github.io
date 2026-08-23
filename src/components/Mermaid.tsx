import { useEffect } from "react";

export default function Mermaid() {
  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | undefined;

    async function setup() {
      const mermaid = (await import("mermaid")).default;
      if (cancelled) return;

      for (const pre of document.querySelectorAll("pre[data-language='mermaid']")) {
        if (!(pre instanceof HTMLElement) || pre.dataset.mermaidReady) continue;
        const source = pre.textContent ?? "";
        const wrap = document.createElement("div");
        wrap.className = "mermaid";
        wrap.dataset.source = source;
        wrap.textContent = source;
        pre.replaceWith(wrap);
      }

      async function render() {
        const theme =
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "dark"
            : "neutral";
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: "strict",
        });
        const nodes = [
          ...document.querySelectorAll<HTMLElement>(".mermaid"),
        ];
        for (const node of nodes) {
          node.removeAttribute("data-processed");
          node.textContent = node.dataset.source ?? "";
        }
        if (nodes.length) await mermaid.run({ nodes });
      }

      await render();

      observer = new MutationObserver(() => {
        void render();
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }

    void setup();
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
