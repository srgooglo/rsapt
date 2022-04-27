import path from "path"
import fs from "fs"

export default async (event, id) => {
    const installationPath = path.resolve(global.InstallationsPath, id)

    const existsInstallationPath = fs.existsSync(installationPath)
    const existsManifestDB = global.LocalManifestDB.has(id)

    return Boolean(existsInstallationPath || existsManifestDB)
}