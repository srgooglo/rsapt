import axios from "axios"
const http = window.bridge.http
const https = window.bridge.https
const path = window.bridge.path
const fs = window.bridge.fs

export function sleep(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration))
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