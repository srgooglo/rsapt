import path from "path"
import LinebridgeServer from "linebridge/dist/server"

import Controllers from "./controllers"

function resolvePrivateLocalIp() {
    const interfaces = require("os").networkInterfaces()
    const addresses = []
    for (const k in interfaces) {
        for (const k2 in interfaces[k]) {
            const address = interfaces[k][k2]
            if (address.family === "IPv4" && !address.internal) {
                addresses.push(address.address)
            }
        }
    }
    return addresses[0]
}

global.repoPackagesDir = path.resolve(process.cwd(), "packages")
global.localHost = resolvePrivateLocalIp()
global.listenPort = process.env.PORT || 3010
global.publicHost = process.env.PUBLIC_HOST || `${process.env.PROTOCOL || "http"}://${global.localHost}:${global.listenPort}`

const server = new LinebridgeServer({
    port: global.listenPort,
},
    Controllers,
)

server.initialize()