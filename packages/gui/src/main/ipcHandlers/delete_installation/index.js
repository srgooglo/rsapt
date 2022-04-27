import fs from "fs"
import path from "path"

export default async (event, id) => {
    const installationPath = path.resolve(global.InstallationsPath, id)

    if (fs.existsSync(installationPath)) {
        fs.rmdirSync(installationPath, { recursive: true })
    }

    global.LocalManifestDB.delete(id)

    return true
}