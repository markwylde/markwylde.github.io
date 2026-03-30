// @ts-check

import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  build: {
    assets: "assets",
  },
  output: "static",
  integrations: [react()],
});
