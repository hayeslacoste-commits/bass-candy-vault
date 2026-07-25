import { defineConfig } from "vite";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  html: {
    transformIndexHtml(html) {
      return html.replace(
        /<\/head>/,
        `<script>
          const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = 'https://i.postimg.cc/cCNwnbrh/favicon.jpg';
          document.getElementsByTagName('head')[0].appendChild(link);
        </script></head>`
      );
    }
  }
});
