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
    mimeTypes: {
      "application/wasm": ["wasm"],
    },
  },
  assetsInclude: ["**/*.wasm"], // 👈 This ensures WASM is served
  plugins: [
    react(),
    wasm(), // Also disable sourcemaps in the dev server
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "esnext", // Required for top-level await
  },
  // optimizeDeps: {
  //   exclude: [
  //     "react",
  //     "react-dom",
  //     "react-router-dom",
  //     "@xmtp/wasm-bindings",
  //     "@xmtp/browser-sdk",
  //   ],
  //   include: ["@xmtp/proto"],
  // },
}));
