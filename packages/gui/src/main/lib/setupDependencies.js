import fs from "fs"
import { _legacy_downloadHTTPSStream } from "./downloader"

export default async () => {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(global.BIN7z)) {
            await fs.mkdirSync(global.BIN7z, { recursive: true })

            await _legacy_downloadHTTPSStream(`https://dl.ragestudio.net/7z-bin/${global._7zScopedDist}/${global._7zBinExecutable}`, `${global.BIN7z}/${_7zBinExecutable}`).catch(err => {
                console.error(err)
                return reject(err)
            })
            await _legacy_downloadHTTPSStream("https://dl.ragestudio.net/7z-bin/7z.dll", `${global.BIN7z}/7z.dll`).catch(err => {
                console.error(err)
                return reject(err)
            })
        }

        return resolve(true)
    })
}