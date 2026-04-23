import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async ({ command, mode }) => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ];

  // Optional plugin for Replit-specific development environment
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    base: '/',
    // root: path.resolve(import.meta.dirname, "client"),
    root: path.resolve(__dirname, "client"),
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
"@shared": path.resolve(__dirname, "shared"),
"@assets": path.resolve(__dirname, "attached_assets"),
        // "@": path.resolve(import.meta.dirname, "client", "src"),
        // "@shared": path.resolve(import.meta.dirname, "shared"),
        // "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      // outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      chunkSizeWarningLimit: 1500, // suppress large chunk warnings
    },
    server: {
      port: 5173,
      open: true,
       proxy: {
      "/api": "http://localhost:5000"
   },
    },
  };
});