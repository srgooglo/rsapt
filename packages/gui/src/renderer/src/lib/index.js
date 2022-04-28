import axios from "axios"

export function sleep(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration))
}

export function IPCInvoke(...args) {
    return new Promise(async (resolve, reject) => {
        const response = await window.bridge.ipcRenderer.invoke(...args)

        if (response.error) {
            return reject(response.error)
        }

        return resolve(response.result)
    })
}

export function getPackages() {
    return new Promise(async (resolve, reject) => {
        const URI = `${window.app.config.RepoServer}/packages`

        const result = await axios.get(URI).catch(err => {
            reject(err)
            return false
        })

        if (result) {
            return resolve(result.data)
        }
    })
}

export function getPackageData(packageId) {
    return new Promise(async (resolve, reject) => {
        const URI = `${window.app.config.RepoServer}/package/${packageId}`

        const result = await axios.get(URI).catch(err => {
            reject(err)
            return false
        })

        if (result) {
            return resolve(result.data)
        }
    })
}