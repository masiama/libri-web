import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      tailwindcss(),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      viteReact(),
    ],
    server: {
      port: 3001,
      open: true,
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
    },
  };
});
