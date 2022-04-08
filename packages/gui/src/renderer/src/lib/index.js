import axios from "axios"
const http = window.bridge.http
const https = window.bridge.https
const path = window.bridge.path
const fs = window.bridge.fs

export function sleep(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration))
}

export async function validateVersionInstallation(version) {
    return await window.bridge.ipcRenderer.invoke("check_version", version)
}

export function getPackages() {
    return new Promise(async (resolve, reject) => {
        const URI = `${window.bridge.originURI}/packages`

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
        const URI = `${window.bridge.originURI}/package/${packageId}`

        const result = await axios.get(URI).catch(err => {
            reject(err)
            return false
        })

        if (result) {
            return resolve(result.data)
        }
    })
}

export function getPackageVersionManifest(packageId, version = "latest") {
    return new Promise(async (resolve, reject) => {
        const URI = `${window.bridge.originURI}/manifest/${packageId}@${version}`

        const result = await axios.get(URI).catch(err => {
            reject(err)
            return false
        })

        if (result) {
            return resolve(result.data)
        }
    })
}

export function installVersion(version) {
    return new Promise(async (resolve, reject) => {
        const URI = `${window.bridge.releasesURI}/${version}/manifest.json`

        const manifest = await axios.get(URI).catch((error) => {
            reject(`[404] Cannot get version data`)
            return false
        })

        if (manifest) {
            // first, download the version data
            const result = await window.bridge.ipcRenderer.invoke("install_version", manifest.data).catch((error) => {
                return false
            })

            if (!result) {
                return reject()
            }

            return resolve(true)
        }
    })
}

export function playVersion(version) {
    return new Promise(async (resolve, reject) => {
        const result = await window.bridge.ipcRenderer.invoke("play_version", version).catch((error) => {
            return false
        })

        if (!result) {
            return reject()
        }

        return resolve(true)
    })
}

export function deleteVersion(version) {
    return new Promise(async (resolve, reject) => {
        const result = await window.bridge.ipcRenderer.invoke("delete_version", version).catch((error) => {
            return false
        })

        if (!result) {
            return reject()
        }

        return resolve(true)
    })
}