import { defineConfig } from "vite";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  html: {
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="icon"[^>]*>/g,
        `<link rel="icon" type="image/x-icon" href="https://i.postimg.cc/cCNwnbrh/favicon.jpg" />`
      );
    }
  }
});
