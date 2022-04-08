import fs from "fs"
import path from "path"
import os from "os"

import { downloadInstanceFiles,  } from "../../lib/downloader"
import { getPackageManifest } from "../../lib/packages"
import SetupInstallerDependencies from "../../lib/setupDependencies"

export default async (event, manifest, params = {}) => {
    if (typeof manifest !== "object") {
        // fetch manifest from server
        console.warn("Manifest is missing, fetching from server...")
        manifest = await getPackageManifest(manifest)
    }

    // first check if the installation is already installed

    // after that, proceding to fetch the entrypoint


    // create the installation directory
    await SetupInstallerDependencies().catch(err => {
        console.error(err)
        return false
    })

    // resolve and init download tmp directory
    const downloadContentPath = path.resolve(global.CachePath, new Date().getTime().toString())

    if (fs.existsSync(downloadContentPath)) {
        fs.unlinkSync(downloadContentPath)
    }

    fs.mkdirSync(downloadContentPath, { recursive: true })

    // resolve final installation directory
    const finalInstallationPath = path.resolve(global.InstallationsPath, manifest.name)

    if (fs.existsSync(finalInstallationPath)) {
        if (params.force) {
            fs.unlinkSync(finalInstallationPath)
        } else {
            throw new Error("Installation already exists")
        }
    } else {
        fs.mkdirSync(finalInstallationPath, { recursive: true })
    }

    // handle downloader for bundles
    if (manifest.bundles && Array.isArray(manifest.bundles)) {
        for await (let bundleArtifact of manifest.bundles) {
            await downloadInstanceFiles([{
                url: bundleArtifact.url,
                path: downloadContentPath,
            }], (percent) => {
                console.log(`Downloading ${percent}%`)
            }, global.SettingsDB.get("DownloadThreads"))
        }
    }

    return false

    // storage installation
    global.LocalManifestDB.set(manifest.id, {
        version: manifest.version,
        plataform: process.platform,
        installationPath: finalInstallationPath,
    })

    // clean cache
    await fs.rmdirSync(downloadContentPath, { recursive: true })

}