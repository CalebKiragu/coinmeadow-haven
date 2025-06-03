import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import wasm from "vite-plugin-wasm";
// import stripSourceMappingURL from "vite-plugin-strip-sourceMapping-url";
import { componentTagger } from "lovable-tagger";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Also disable sourcemaps in the dev server
    // resolve: {
    //   dedupe: ["@xmtp/xmtp-js"],
    // },
    mimeTypes: {
      // 👇 Add this override
      "application/wasm": ["wasm"],
    },
  },
  assetsInclude: ["**/*.wasm"], // 👈 This ensures WASM is served
  plugins: [
    react(),
    wasm(),
    // stripSourceMappingURL(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    // Prevent Vite from trying to load missing “.map” files in node_modules
    sourcemap: true,
    // sourcemap: false,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    // exclude: ["@xmtp/xmtp-js"], // ensure it's not pre-bundled
  },
}));
