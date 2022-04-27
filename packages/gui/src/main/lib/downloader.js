import { BrowserWindow } from "electron"
import fs from "fs"
import pMap from "p-map"

import electrondl from "electron-dl"
import adapter from "axios/lib/adapters/http"
import axios from "axios/lib/axios"
import https from "https"

export async function downloadArray({ array, threads = 4, onDownloadOnce, onFail, onProgress }) {
    return new Promise(async (resolve, reject) => {
        let downloaded = 0

        await pMap(
            array,
            async (item) => {
                if (!item.path || !item.url) {
                    console.warn("Missing params (path or url), skipping download instance", item)
                    return
                }

                try {
                    await new Promise((res, rej) => {
                        downloadFile({
                            destination: item.path,
                            url: item.url,
                            overwrite: true,
                            onProgress: (prog) => {
                                if (typeof onProgress === "function") {
                                    onProgress({
                                        item,
                                        ...prog
                                    })
                                }
                            },
                            onCompleted: () => {
                                downloaded++

                                if (typeof onDownloadOnce === "function") {
                                    onDownloadOnce({
                                        downloadCount: downloaded,
                                        item,
                                    })
                                }

                                console.log(`[DOWNLOADER] Downloaded ${downloaded} of ${array.length}`)
                                return res()
                            }
                        })
                    })
                } catch (error) {
                    console.error("Failed to download", item, error)

                    if (typeof onFail === "function") {
                        onFail({
                            downloadCount: downloaded,
                            item,
                            error,
                        })
                    }
                }
            },
            { concurrency: threads }
        )

        if (downloaded === array.length) {
            console.log("All downloads finished")
            return resolve()
        }
    })
}

export const downloadFile = async ({ destination, url, onProgress, onCompleted }) => {
    const result = await electrondl.download(global.lastFocusedWindow, url, {
        directory: destination,
        onProgress,
        onCompleted,
    })

    return result
}

export function _legacy_downloadHTTPSStream(url, destination) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destination)

        const request = https.get(url, (response) => {
            // check if response is success
            if (response.statusCode !== 200) {
                return reject("Response status was " + response.statusCode)
            }

            response.pipe(file)
        })

        // close() is async, call cb after close completes
        file.on("finish", () => file.close(() => {
            resolve(destination)
        }))

        request.on("error", (err) => {
            console.error(err)
            fss.unlinkSync(destination)
            return reject(err.message)
        })

        file.on("error", (err) => {
            fss.unlinkSync(destination)
            return reject(err.message)
        })
    })
}

export async function _legacy_downloadFile(url, destination) {
    return new Promise(async (resolve, reject) => {
        console.log(destination)
        const file = fss.createWriteStream(destination)

        const { data } = await axios({
            url,
            method: "GET",
            adapter,
            responseType: "stream",
            responseEncoding: null,
            timeout: 60000 * 20
        }).catch((err) => {
            console.error(err)

            return reject(err.message)
        })

        data.pipe(file)

        // close() is async, call cb after close completes
        file.on("finish", () => file.close(() => {
            return resolve(destination)
        }))

        file.on("error", (err) => {
            console.error(err)

            fss.unlinkSync(destination)
            return reject(err.message)
        })
    })

}