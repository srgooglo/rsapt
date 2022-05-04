import react from "@vitejs/plugin-react"
import { viteCommonjs } from "@originjs/vite-plugin-commonjs"
import { builtinModules } from "module"

import path from "path"
import { defineConfig } from "vite"
import getConfig from "./.config.js"

const config = getConfig()

const fixed__dirname = path.resolve(__dirname, "../src/renderer/")

config.root = path.join(__dirname, "../src/renderer")

config.plugins = [
  react(),
  viteCommonjs()
]

config.base = "./"

config.build = {
  emptyOutDir: true,
  outDir: "../../dist/renderer",
  minify: process.env.NODE_ENV === "production",
  // rollupOptions: {
  //   external: [
  //     ...builtinModules,
  //     "electron",
  //   ],
  //   output: {
  //     entryFileNames: "[name].cjs",
  //   },
  // },
}

config.resolve.alias = {
  "~/": `${path.resolve(fixed__dirname, "src")}/`,
  "__": fixed__dirname,
  "@src": path.resolve(fixed__dirname, "src"),
  lib: path.join(fixed__dirname, "src/lib"),
  schemas: path.join(fixed__dirname, "schemas"),
  extensions: path.resolve(fixed__dirname, "src/extensions"),
  pages: path.join(fixed__dirname, "src/pages"),
  theme: path.join(fixed__dirname, "src/theme"),
  components: path.join(fixed__dirname, "src/components"),
  models: path.join(fixed__dirname, "src/models"),
  utils: path.join(fixed__dirname, "src/utils"),
}

// https://vitejs.dev/config/
export default defineConfig(config)
