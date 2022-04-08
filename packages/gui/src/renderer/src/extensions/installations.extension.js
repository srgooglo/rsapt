import { Extension } from "evite"
import { message } from "antd"

export default class SettingsExtension extends Extension {
    makeInstallation = (manifest) => {
        return new Promise(async (resolve, reject) => {
            const result = await window.bridge.ipcRenderer.invoke("make_install", manifest)
            console.log(result)
            if (!result) {
                return reject(`Unknow error`)
            }

            return resolve(true)
        })
    }

    window = {
        "makeInstallation": this.makeInstallation 
    }
}