import { ComplexController } from "linebridge/dist/classes"
import path from "path"
import fs from "fs"

export default class PackageController extends ComplexController {
    static refName = "PackageController"

    methods = {
        getPackages: async () => {
            const packages = []
            const packagesDirs = fs.readdirSync(global.repoPackagesDir).filter(dir => fs.statSync(path.join(global.repoPackagesDir, dir)).isDirectory())

            for await (const pkg of packagesDirs) {
                const packageManifest = await this.methods.getPackage({
                    id: pkg,
                }).catch(() => {
                    return false
                })

                if (packageManifest) {
                    packages.push(packageManifest)
                }
            }

            return packages
        },
        getPackage: async (params = {}) => {
            if (!params.id) {
                throw new Error("Missing package ID")
            }

            const packagePath = path.join(global.repoPackagesDir, params.id)

            if (!fs.existsSync(packagePath) || !fs.statSync(packagePath).isDirectory()) {
                throw new Error(`Package not found: [${params?.id}]`)
            }

            const packageManifestPath = path.join(packagePath, "package")

            if (!fs.existsSync(packageManifestPath) || !fs.statSync(packageManifestPath).isFile()) {
                throw new Error(`Package manifest not found: [${params?.id}]`)
            }

            let packageManifest = JSON.parse(fs.readFileSync(packageManifestPath, "utf8"))

            // read all versions available (filter, only dirs)
            packageManifest.versions = fs.readdirSync(packagePath).filter(version => fs.statSync(path.join(packagePath, version)).isDirectory())
            packageManifest.manifests = packageManifest.versions.map((version) => {
                try {
                    let versionManifest = JSON.parse(fs.readFileSync(path.join(packagePath, version, "manifest"), "utf8"))

                    // process bundle uri resolver
                    if (Array.isArray(versionManifest.bundles)) {
                        versionManifest.bundles = versionManifest.bundles.map(bundle => {
                            return {
                                ...bundle,
                                downloadUrl: `${global.publicHost}/bundle/${params.id}@${version}/${bundle.id}`,
                            }
                        })
                    }

                    // resolve entrypoint script url

                    return {
                        version,
                        ...versionManifest,
                    }
                }
                catch {
                    return null
                }

            }).filter(manifest => manifest)

            return packageManifest
        },
        getEntrypointScript: async (params = {}) => {
            if (!params.id) {
                throw new Error("Missing package ID")
            }

            if (params.id.includes("@")) {
                const [id, version] = params.id.split("@")
                params.id = id
                params.version = version
            }

            if (!params.version) {
                params.version = "latest"
            }

            const entrypoint = path.join(global.repoPackagesDir, params.id, params.version, "entrypoint")

            if (!fs.existsSync(entrypoint) || !fs.statSync(entrypoint).isFile()) {
                throw new Error(`Entrypoint not found for package: [${params?.id}] with version [${params?.version}]`)
            }

            return fs.readFileSync(entrypoint, "utf8")
        }
    }

    get = {
        "/packages": async (req, res) => {
            await this.methods.getPackages()
                .then((data) => {
                    return res.json(data)
                })
                .catch((err) => {
                    return res.status(400).json({
                        message: err.message
                    })
                })
        },
        "/package/:id": async (req, res) => {
            await this.methods.getPackage(req.params)
                .then((data) => {
                    return res.json(data)
                })
                .catch((err) => {
                    return res.status(400).json({
                        message: err.message
                    })
                })
        },
        "/package/:id/entrypoint": async (req, res) => {
            await this.methods.getEntrypointScript(req.params)
                .then((data) => {
                    return res.json(data)
                })
                .catch((err) => {
                    return res.status(400).json({
                        message: err.message
                    })
                })
        }
    }
}