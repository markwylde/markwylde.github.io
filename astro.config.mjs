// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
	build: {
		assets: "assets",
	},
	output: "static",
	integrations: [react()],
});
