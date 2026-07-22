import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// Tauri expects a fixed dev port and exposes TAURI_ENV_* during builds.
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  // Prevent Vite from clearing Rust errors from the Tauri console.
  clearScreen: false,
  server: {
    port: 3002,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 3003 } : undefined,
    // Tauri watches the Rust side; don't let Vite watch it too.
    watch: { ignored: ["**/src-tauri/**"] },
  },
  // Only VITE_ and TAURI_ENV_* vars are exposed to the client.
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    // Match the webview engine Tauri ships per platform.
    target:
      process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
