import path from "path"
import react from "@vitejs/plugin-react"
import pkg from "../package.json"
import Pages from "vite-plugin-pages"

export default (config = {}) => {
    if (!config.resolve) {
        config.resolve = {}
    }
    if (!config.server) {
        config.server = {}
    }

    config.server.port = process.env.listenPort ?? 8000
    config.server.host = "0.0.0.0"
    config.server.fs = {
        allow: [".."]
    }

    config.envDir = path.join(__dirname, "environments")

    config.css = {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    }

    config.mode = process.env.NODE_ENV

    config.root = path.join(__dirname, "../src/renderer")

    config.plugins = [
        react(),
        Pages({
            react: true,
            extensions: ["jsx", "tsx"],
        }),
    ]

    config.base = "./"

    config.build = {
        emptyOutDir: true,
        outDir: "../../dist/renderer",
    }

    config.server = {
        host: pkg.env.HOST,
        port: pkg.env.PORT,
    }

    return config
}