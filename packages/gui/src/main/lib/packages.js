import axios from "axios"

function getPackageManifest(id) {
    return new Promise(async (resolve, reject) => {
        const URI = `${global.SettingsDB.get("RepoServer")}/package/${id}`

        const result = await axios.get(URI).catch(err => {
            reject(err)
            return false
        })

        if (result) {
            return resolve(result.data)
        }
    })
}

function getEntrypointScript(id, version) {
    return new Promise(async (resolve, reject) => {
        const URI = `${global.SettingsDB.get("RepoServer")}/package/${id}@${version}/entrypoint`

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
    getPackageManifest,
    getEntrypointScript,
}