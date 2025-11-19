import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/igni-code-challenge/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
