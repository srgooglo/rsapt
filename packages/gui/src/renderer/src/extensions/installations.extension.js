import { Extension } from "evite"
import { message } from "antd"

export default class InstallationsExtension extends Extension {
    makeInstallation = (packageManifest, version) => {
        return new Promise(async (resolve, reject) => {
            const packageId = (typeof packageManifest === "object") ? packageManifest.name : packageManifest

            const result = await window.bridge.ipcRenderer.invoke("make_install", packageManifest, version)

            if (!result) {
                return reject(`Unknown error`)
            }

            message.success(`[${packageId}] Package installed successfully`)

            return resolve(true)
        })
    }

    checkInstallation = async (id) => {
        return await window.bridge.ipcRenderer.invoke("check_installation", id)
    }

    uninstallPackage = (id) => {
        return new Promise(async (resolve, reject) => {
            const result = await window.bridge.ipcRenderer.invoke("delete_installation", id)

            if (!result) {
                return reject(`Unknown error`)
            }

            return resolve(true)
        })
    }

    openInstallationDir = (id) => {
        return new Promise(async (resolve, reject) => {
            const result = await window.bridge.ipcRenderer.invoke("open_installation_dir", id)

            if (!result) {
                return reject(`Unknown error`)
            }

            return resolve(true)
        })
    }

    window = {
        "makeInstallation": this.makeInstallation,
        "checkInstallation": this.checkInstallation,
        "uninstallPackage": this.uninstallPackage,
        "openInstallationDir": this.openInstallationDir,
    }
}