import { ComplexController } from "linebridge/dist/classes"
import path from "path"
import fs from "fs"

export default class ManifestController extends ComplexController {
    static refName = "ManifestController"

    methods = {
        getPackageManifests: async (params) => {
            if (!params.id) {
                throw new Error("Missing package ID")
            }

            const packagesDir = path.resolve(global.repoPackagesDir, params.id)

            if (!fs.existsSync(packagesDir)) {
                throw new Error("Package not found")
            }

            // read all versions manifest (use async/await)
            let manifests = []
            const versions = fs.readdirSync(packagesDir)

            for await (const version of versions) {
                const manifest = await this.methods.getPackageManifest({
                    id: params.id,
                    version: version,
                })

                manifests.push(manifest)
            }

            return manifests
        },
        getPackageManifest: async (params = {}) => {
            if (!params.id) {
                throw new Error("Missing package ID")
            }

            // check params.id string for version (e.g. testId@0.0.1)
            if (params.id.includes("@")) {
                const [id, version] = params.id.split("@")
                params.id = id
                params.version = version
            }

            if (!params.version) {
                params.version = "latest"
            }

            const packageDir = path.resolve(global.repoPackagesDir, params.id, params.version)

            // check if this directory exist and can be readed
            if (!fs.existsSync(packageDir) || !fs.statSync(packageDir).isDirectory()) {
                throw new Error(`Package not found: [${params?.id}] version: [${params?.version}]`)
            }

            const manifestPath = path.join(packageDir, "manifest")

            // check if manifest is readable
            if (!fs.existsSync(manifestPath) || !fs.statSync(manifestPath).isFile()) {
                throw new Error(`Missing manifest for package: [${params?.id}] version: [${params?.version}]`)
            }

            // read manifest
            let manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))

            if (Array.isArray(manifest.bundles)) {
                manifest.bundles = manifest.bundles.map(bundle => {
                    return {
                        ...bundle,
                        url: `${global.publicHost}/bundle/${params.id}@${params.version}/${bundle.id}`,
                    }
                })
            }


            return manifest
        },
    }

    get = {
        "/manifest/:id": async (req, res) => {
            await this.methods.getPackageManifest(req.params)
                .then((data) => {
                    return res.json(data)
                })
                .catch((err) => {
                    return res.status(400).json({
                        message: err.message
                    })
                })
        },
        "/manifests/:id": async (req, res) => {
            await this.methods.getPackageManifests(req.params)
                .then((data) => {
                    return res.json(data)
                })
                .catch((err) => {
                    return res.status(400).json({
                        message: err.message
                    })
                })
        },
    }
}