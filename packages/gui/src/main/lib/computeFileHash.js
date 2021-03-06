import fs from "fs"
import crypto from "crypto"

export default (filePath, algorithm = "sha1") => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithm)

        fs.createReadStream(filePath)
            .on("data", data => hash.update(data))
            .on("end", () => resolve(hash.digest("hex")))
            .on("error", reject)
    })
}