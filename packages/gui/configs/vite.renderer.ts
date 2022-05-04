import path from "path"
import { builtinModules } from "module"

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import Pages from "vite-plugin-pages"

const fixed_src = path.resolve(__dirname, "../src/renderer")

let config = {
  mode: process.env.NODE_ENV,
  root: fixed_src,
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  },
  plugins: [
    react(),
    Pages({
      react: true,
      routeStyle: "next",
      extensions: ["jsx", "tsx"],
    }),
  ],
  build: {
    emptyOutDir: true,
    outDir: "../../dist/renderer",
    minify: process.env.NODE_ENV === "production",
    rollupOptions: {
      external: [
        ...builtinModules,
        "electron",
      ],
    },
  },
  resolve: {
    alias: {
      "@src": fixed_src,
      schemas: path.join(fixed_src, "schemas"),
      lib: path.join(fixed_src, "lib"),
      extensions: path.join(fixed_src, "extensions"),
      pages: path.join(fixed_src, "pages"),
      theme: path.join(fixed_src, "theme"),
      components: path.join(fixed_src, "components"),
      models: path.join(fixed_src, "models"),
      utils: path.join(fixed_src, "utils"),
    }
  }
}

export default defineConfig(config)
