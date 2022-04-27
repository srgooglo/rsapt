import path from "path"

export default (event, id) => {
    const installationPath = path.resolve(global.InstallationsPath, id)

    // open directory (cross-platform)
    if (process.platform === "darwin") {
        return require("child_process").exec(`open ${installationPath}`)
    } else if (process.platform === "win32") {
        return require("child_process").exec(`start ${installationPath}`)
    } else {
        return require("child_process").exec(`xdg-open ${installationPath}`)
    }
}