import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        entry: "server"
      }
    }),
    nitro({
      preset: "vercel"
    }),
    tailwindcss()
  ]
});
