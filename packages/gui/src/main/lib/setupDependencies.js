import fs from "fs"
import path from "path"
import { _legacy_downloadHTTPSStream } from "./downloader"

export default async () => {
    return new Promise(async (resolve, reject) => {
        const bin7zDirname = path.dirname(global.BIN7z)

        await fs.mkdirSync(bin7zDirname, { recursive: true })

        await _legacy_downloadHTTPSStream(
            `https://dl.ragestudio.net/7z-bin/${global._7zScopedDist}/${global._7zBinExecutable}`,
            global.BIN7z,
        ).catch(err => {
            console.error(err)
            return reject(err)
        })
        await _legacy_downloadHTTPSStream(
            "https://dl.ragestudio.net/7z-bin/7z.dll",
            `${bin7zDirname}/7z.dll`
        ).catch(err => {
            console.error(err)
            return reject(err)
        })

        // fix permissions on unix systems
        if (process.platform !== "win32") {
            fs.chmodSync(global.BIN7z, "755")
            fs.chmodSync(`${bin7zDirname}/7z.dll`, "755")
        }

        return resolve(true)
    })
}