import path from "path"
import { defineConfig } from "vite"
import getConfig from "./.config.js"

const config = getConfig()

const fixed__dirname = path.resolve(__dirname, "../src/renderer/")

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
