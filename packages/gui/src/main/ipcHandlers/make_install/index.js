import fs from "fs"
import path from "path"
import os from "os"

// helpers
import check_installation from "../check_installation"

// libs
import SetupInstallerDependencies from "../../lib/setupDependencies"
import { getPackageManifest, getEntrypointScript } from "../../lib/packages"
import { downloadFile } from "../../lib/downloader"
import unpackage from "../../lib/unpackage"
import requireFromString from "../../lib/requireFromString"

export default async (event, packageManifest, version, params = {}) => {
    // set paths resolver
    let resolver = {
        ...global.defaultResolver,
    }

    let installationContext = {
        plataform: process.platform,
        package: null,
        paths: {}
    }

    if (!packageManifest) {
        throw new Error("Missing version param")
    }

    if (typeof packageManifest === "string") {
        // fetch manifest from server
        console.warn("Manifest is missing, fetching from server...")
        packageManifest = await getPackageManifest(packageManifest)
    }

    // match version manifest 
    const versionManifest = packageManifest.manifests.find(manifest => manifest.version === version)

    if (!versionManifest) {
        throw new Error(`Version not found: [${version}]`)
    }

    installationContext.package = {
        id: packageManifest.id,
        version: version,
        versionManifest: versionManifest,
    }

    // first check if the installation is already installed
    const isInstalled = await check_installation(event, packageManifest.id)

    if (isInstalled) {
        if (!params.force) {
            throw new Error("Installation already exists")
        }

        console.warn("Installation already installed, reinstalling...")

        // remove installation
        await fs.rmdirSync(path.resolve(global.InstallationsPath, packageManifest.id), { recursive: true })
    }

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

    console.debug(`🚚 Creating cache content directory: ${downloadContentPath}`)

    fs.mkdirSync(downloadContentPath, { recursive: true })

    // resolve final installation directory
    const mainInstallationPath = installationContext.paths["mainInstallationPath"] = path.resolve(global.InstallationsPath, packageManifest.id)

    console.debug(`📦 Creating installation directory: ${mainInstallationPath}`)
    fs.mkdirSync(mainInstallationPath, { recursive: true })

    // fix final installation dir permissions
    fs.chmodSync(mainInstallationPath, "777")

    // after that, procceding to fetch the entrypoint from server
    let entrypointScript = await getEntrypointScript(packageManifest.id, version)

    // compile the entrypoint script
    entrypointScript = await requireFromString(entrypointScript, "entrypoint")

    if (typeof entrypointScript.resolver == "object") {
        resolver = {
            ...resolver,
            ...entrypointScript.resolver,
        }
    }

    // handle downloader for bundles
    if (versionManifest.bundles && Array.isArray(versionManifest.bundles)) {
        let artifacts = versionManifest.bundles.map((bundleArtifact) => {
            return {
                ...bundleArtifact,
                downloadPath: path.resolve(downloadContentPath, `${bundleArtifact.id}.bundle`),
            }
        })

        const onProgress = (progress) => {
            // send progress to main win
        }

        const onFailOnce = (error) => {
            // send progress to main win
        }

        const onDownloadOnce = (progress) => {
            console.log(`✅ [${progress.id}] Download done`)
            // send progress to main win
        }

        //const downloadThreads = global.SettingsDB.get("DownloadThreads")
        //console.debug(`📶 Downloading with [${downloadThreads}] threads`)

        // await downloadArray({
        //     array: artifacts.map((artifact) => {
        //         artifact.url = artifact.downloadUrl
        //         artifact.path = artifact.downloadPath

        //         return artifact
        //     }),
        //     onProgress,
        //     onDownloadOnce,
        //     onFailOnce,
        //     downloadThreads,
        // })


        // resolve bundle paths
        artifacts = artifacts.map((artifact) => {
            // time for parser
            if (typeof artifact.extractPath === "string") {
                // parse `bundleArtifact.extractPath` string for match variables, like ${variable}
                // TODO: support async variables

                artifact.extractPath = artifact.extractPath.replace(/\$\{([^}]+)\}/g, (match, variable) => {
                    return resolver[variable]
                })
            }

            artifact.extractPath = artifact.extractPath ?
                path.join(artifact.extractPath, artifact.extractOnDirname ?? "./") :
                path.resolve(mainInstallationPath, (artifact.extractOnDirname ?? artifact.id))

            return artifact
        })

        installationContext.paths["artifacts"] = artifacts.map((artifact) => {
            return {
                id: artifact.id,
                extractPath: artifact.extractPath,
            }
        })

        // install bundles
        for (let artifact of artifacts) {
            console.log(`📦 Installing bundle: [${artifact.id}] \n`, artifact)

            await downloadFile({
                url: artifact.downloadUrl,
                destination: artifact.downloadPath,
                overwrite: true,
                onProgress: (prog) => {
                    onProgress(prog, artifact)
                },
                onCompleted: () => {
                    onDownloadOnce(artifact)
                }
            })

            console.log(`📦  Extracting bundle: [${artifact.id}] on path (${artifact.extractPath})`)

            // // make installation directory
            // if (fs.existsSync(bundleExtractedPath)) {
            //     fs.unlinkSync(bundleExtractedPath)
            // }

            // check if bundle is readable
            if (!fs.existsSync(artifact.downloadPath) && !fs.lstatSync(artifact.downloadPath).isFile()) {
                throw new Error(`‼️ Bundle file not found: [${artifact.downloadPath}]`)
            }

            // extract bundles into installation directory (use 7z)
            await unpackage(artifact.downloadPath, artifact.extractPath, (update) => {
                console.log(update)
            })
        }
    }

    // run steps 
    console.log(`🛠  Making installation steps`)

    if (entrypointScript.steps && Array.isArray(entrypointScript.steps)) {
        for (const step of entrypointScript.steps) {
            if (typeof step === "function") {
                console.log(`🛠  Running step: [${step.name}]`)

                const stepResult = await step(installationContext)

                console.log(stepResult)
            } else {
                console.log(`🛠  Skipping step: [${step.name}] (not a function)`)
            }
        }
    }

    // storage installation
    global.LocalManifestDB.set(packageManifest.id, installationContext)

    // clean cache
    await fs.rmdirSync(downloadContentPath, { recursive: true })

    return true
}