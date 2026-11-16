import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      tailwindcss(),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      viteReact(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon-180x180.png"],
        manifest: {
          name: "Libri",
          short_name: "Libri",
          description: "Scan a book and see if you already own it.",
          display: "standalone",
          start_url: "/",
          scope: "/",
          background_color: "#F7F4FF",
          theme_color: "#F7F4FF",
          icons: [
            { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
            { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
            {
              src: "maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: { navigateFallbackDenylist: [/^\/api\//] },
        devOptions: { enabled: true },
      }),
    ],
    server: {
      port: 3001,
      open: true,
      allowedHosts: [".ts.net"],
      proxy: {
        "/api/v1": {
          target: env.VITE_API_BASE,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3001,
      open: true,
      allowedHosts: [".ts.net"],
    },
  };
});
