import axios from "axios"

function getPackageManifest(id) {
    return new Promise(async (resolve, reject) => {
        const URI = `${window.bridge.originURI}/package/${id}`

        const result = await axios.get(URI).catch(err => {
            reject(err)
            return false
        })

        if (result) {
            return resolve(result.data)
        }
    })
}

export {
    getPackageManifest
}