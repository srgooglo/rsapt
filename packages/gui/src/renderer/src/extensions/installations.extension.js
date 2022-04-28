import { Extension } from "evite"
import { message } from "antd"

export default class InstallationsExtension extends Extension {
    makeInstallation = (packageManifest, version, params = {}) => {
        const packageId = (typeof packageManifest === "object") ? packageManifest.name : packageManifest

        // const onProgress = (progress) => {
        //     if (typeof params.onProgress === "function") {
        //         params.onProgress(progress)
        //     }

        //     window.app.eventBus.emit(`installation.progress.${packageId}`, progress)
        // }

        return new Promise(async (resolve, reject) => {
            window.IPCInvoke(
                "make_install",
                packageManifest,
                version,
            )
                .catch((err) => {
                    console.error(err)
                    message.error(err)

                    window.app.eventBus.emit(`installation.error.${packageId}`, err)

                    return reject(err)
                })
                .then((installation) => {
                    console.log(installation)
                    message.success(`[${installation.package.id}] Package installed successfully`)

                    window.app.eventBus.emit(`installation.finished.${installation.package.id}`, installation)

                    return resolve(installation)
                })

            message.info(`[New task] Installing ${packageId}@${version}`)

            window.app.eventBus.emit(`installation.started`, {
                packageId,
            })
            window.app.eventBus.emit(`installation.started.${packageId}`)
        })
    }

    checkInstallation = async (id) => {
        return await window.IPCInvoke("check_installation", id)
    }

    uninstallPackage = (id) => {
        return new Promise(async (resolve, reject) => {
            const result = await window.IPCInvoke("delete_installation", id)

            if (!result) {
                return reject(`Unknown error`)
            }

            return resolve(true)
        })
    }

    openInstallationDir = (id) => {
        return new Promise(async (resolve, reject) => {
            const result = await window.IPCInvoke("open_installation_dir", id)

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