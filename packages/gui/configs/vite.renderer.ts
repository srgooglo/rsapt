import react from "@vitejs/plugin-react"
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"
import { builtinModules } from "module"

import path from "path"
import { defineConfig } from "vite"
import getConfig from "./.config.js"

const fixed_src = path.resolve(__dirname, "../src/renderer/")

let config = getConfig()

config.root = fixed_src
config.plugins = [
  react(),
  viteCommonjs()
]
config.build = {
  emptyOutDir: true,
  outDir: "../../dist/renderer",
  minify: process.env.NODE_ENV === "production",
  rollupOptions: {
    external: [
      ...builtinModules,
      "electron",
    ],
  },
}
config.resolve.alias = {
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

export default defineConfig(config)
