import { ComplexController } from "linebridge/dist/classes"
import path from "path"
import fs from "fs"

export default class BundleController extends ComplexController {
    static refName = "BundleController"

    get = {
        "/bundle/:id/:bundleId": async (req, res) => {
            let { params } = req

            // fix extname
            params.bundleId = `${params.bundleId}.bundle`

            if (params.id.includes("@")) {
                const [id, version] = params.id.split("@")
                params.id = id
                params.version = version
            }

            if (!params.version) {
                params.version = "latest"
            }

            const bundleFilePath = path.resolve(global.repoPackagesDir, params.id, params.version, "bundles", params.bundleId)

            // check if this directory exist and can be readed
            if (!fs.existsSync(bundleFilePath) || !fs.statSync(bundleFilePath).isFile()) {
                throw new Error(`Bundle missing: [${params?.id}] version: [${params?.version}] bundle: [${params?.bundleId}]`)
            }

            return res.sendFile(bundleFilePath)
        },
    }
}