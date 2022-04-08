import path from "path"
import pkg from "../package.json"

export default (config = {}) => {
    if (!config.resolve) {
        config.resolve = {}
    }
    if (!config.server) {
        config.server = {}
    }

    config.mode = process.env.NODE_ENV

    config.server = {
        host: pkg.env.HOST,
        port: pkg.env.PORT,
        fs: {
            allow: [".."]
        }
    }

    config.envDir = path.join(__dirname, "environments")

    config.css = {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    }

    return config
}