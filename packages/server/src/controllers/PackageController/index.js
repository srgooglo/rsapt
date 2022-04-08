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
                })

                packages.push(packageManifest)
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

            return packageManifest
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
        }
    }
}