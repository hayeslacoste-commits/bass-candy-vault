import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {}, // Tells the bundler to skip the standard root index.html check
    },
  },
});
