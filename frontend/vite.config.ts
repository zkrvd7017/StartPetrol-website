import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: Number(process.env.VITE_DEV_SERVER_PORT || 8080),
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || process.env.VITE_API_ORIGIN || "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      "/ws": {
        target: process.env.VITE_WS_TARGET || process.env.VITE_WS_ORIGIN || "ws://localhost:8000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    allowedHosts: [
      "startpetrol.uz",
      "www.startpetrol.uz",
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "51.21.222.146"
    ],
    host: "0.0.0.0",
    port: Number(process.env.VITE_DEV_SERVER_PORT || 80),
    strictPort: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
