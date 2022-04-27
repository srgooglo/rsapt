const { extractFull } = require("node-7z")

export default (from, to, observer) => {
    return new Promise((resolve, reject) => {
        const unpackStream = extractFull(from, to, {
            $bin: global.BIN7z,
            $progress: true,
            recursive: true
        })

        if (typeof (observer) == "function") {
            unpackStream.on("progress", (progress) => {
                observer(`Extracted (${progress.fileCount}) files`)
            })
        }

        unpackStream.on("end", () => {
            return resolve(true)
        })

        unpackStream.on("error", (err) => {
            return reject(err)
        })
    })
}