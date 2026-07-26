import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        preset: "vercel", // This forces Vinxi to build a serverless function structure instead of static HTML files
      },
    }),
    tailwindcss(),
  ],
});
