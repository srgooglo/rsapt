import { extractFull } from "node-7z"

export default (from, destination) => {
    return new Promise((resolve, reject) => {
        console.log(`${global.BIN7z}/${global._7zBinExecutable}`)

        const unpackStream = extractFull(from, destination, {
            $bin: `${global.BIN7z}/${global._7zBinExecutable}`,
            recursive: true,
        })

        unpackStream.on("end", () => {
            return resolve(true)
        })

        unpackStream.on("error", (err) => {
            return reject(err)
        })
    })
}