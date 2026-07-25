import { defineConfig } from "vite";
import { tanstackStartVite } from "@tanstack/start/vite";

export default defineConfig({
  plugins: [
    tanstackStartVite()
  ]
});
