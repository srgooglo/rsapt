import fs from "fs"
import path from "path"

export default async (event, version) => {
    const installationPath = path.resolve(InstallationsPath, version)

    if (fs.existsSync(installationPath)) {
        fs.rmdirSync(installationPath, { recursive: true })
    }

    global.LocalManifestDB.delete(version)

    return true
}