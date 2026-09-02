// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  build: {
    assets: "assets",
  },
  output: "static",
  markdown: {
    // Two themes, switched by the site's [data-theme] rather than by
    // prefers-color-scheme, so highlighting follows the theme toggle.
    // The themes' own backgrounds are dropped in Layout.astro — code blocks
    // sit on --surface-2 like every other recessed surface on the site.
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "night-owl",
      },
      defaultColor: false,
    },
  },
  integrations: [react(), mdx()],
});
