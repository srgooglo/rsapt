import React from "react"
import * as antd from "antd"
import * as Icons from "feather-reactjs"

import { InstallationPrompt } from "components"

import "./index.less"

import {
    useParams,
    useNavigate,
} from "react-router-dom"

import {
    getPackageData,
} from "lib"

export default () => {
    let params = useParams()
    let navigate = useNavigate()

    const [data, setData] = React.useState(null)
    const [isInstalled, setIsInstalled] = React.useState(false)
    const [installationDetails, setInstallationDetails] = React.useState(null)
    const [isInstalling, setIsInstalling] = React.useState(false)

    const checkIsInstalled = async () => {
        let isInstalled = await window.app.checkInstallation(params.id)

        setIsInstalled(isInstalled.existFiles)
        setInstallationDetails(isInstalled)

        return isInstalled
    }

    const checkIsInstalling = async () => {
        let isInstalling = await window.bridge.ipcRenderer.invoke("tasks.has", `packageInstallation.${params.id}`)

        console.log(isInstalling)

        setIsInstalling(isInstalling)

        return isInstalling
    }

    const loadPackageData = async () => {
        const packageData = await getPackageData(params.id).catch(error => {
            console.error(error)
            antd.message.error("Failed to load package data")

            navigate("/")
            return false
        })

        if (packageData) {
            setData(packageData)
        }
    }

    const onClickInstall = async () => {
        window.app.DrawerController.open("InstallationPrompt", InstallationPrompt, {
            props: {
                closeIcon: false,
                closable: false,
                maskClosable: false,
                headerStyle: {
                    display: "none",
                    height: 0,
                },
                bodyStyle: {
                    padding: "15px 30px",
                },
            },
            componentProps: {
                package: data,
            },
        })
    }

    const onClickUninstall = async () => {
        await window.app.uninstallPackage(params.id).catch((error) => {
            antd.message.error(`Failed to uninstall package [${error.message}]`)
        })

        await checkIsInstalled()
    }

    const onClickOpenDir = async () => {
        await window.app.openInstallationDir(params.id).catch((error) => {
            antd.message.error(`Failed to open installation directory [${error.message}]`)
        })
    }

    const onInstallationStart = async () => {
        setIsInstalling(true)
    }

    const onInstallationFinished = async () => {
        setIsInstalling(false)
        await checkIsInstalled()
    }

    const onInstallationError = async () => {
        setIsInstalling(false)
        await checkIsInstalled()
    }

    React.useEffect(() => {
        loadPackageData()
        checkIsInstalled()
        checkIsInstalling()

        window.app.eventBus.on(`installation.started.${params.id}`, onInstallationStart)
        window.app.eventBus.on(`installation.finished.${params.id}`, onInstallationFinished)
        window.app.eventBus.on(`installation.error.${params.id}`, onInstallationError)

        return () => {
            window.app.eventBus.off(`installation.started.${params.id}`, onInstallationStart)
            window.app.eventBus.off(`installation.finished.${params.id}`, onInstallationFinished)
            window.app.eventBus.on(`installation.error.${params.id}`, onInstallationError)
        }
    }, [])

    if (!data) {
        return <antd.Skeleton active />
    }

    console.log(installationDetails)

    return <div className="package">
        <div className="header">
            <div className="icon">
                {data.icon ? <img src={data.icon} /> : <Icons.Package />}
            </div>
            <div>
                <h1>{data.name}</h1>

                <div className="description">
                    {data.description}
                </div>
            </div>
        </div>

        <div className="actions">
            <div>
                <antd.Button
                    type="primary"
                    icon={<Icons.DownloadCloud />}
                    onClick={onClickInstall}
                    disable={isInstalling}
                    loading={isInstalling}
                >
                    {
                        isInstalling ? "Installing..." : "Install version"
                    }
                </antd.Button>
            </div>
            {isInstalled && <div>
                <antd.Button
                    type="danger"
                    icon={<Icons.X />}
                    onClick={onClickUninstall}
                >
                    Uninstall
                </antd.Button>
            </div>}
            {isInstalled && <div>
                <antd.Button
                    icon={<Icons.Folder />}
                    onClick={onClickOpenDir}
                >
                    Open directory
                </antd.Button>
            </div>}
        </div>
        <div className="details">
            {
                installationDetails?.manifest?.package?.version && <div>
                    <Icons.Tag /> Installed version
                    <div>
                        <antd.Tag>
                            {installationDetails.manifest.package.version}
                        </antd.Tag>
                    </div>
                </div>
            }
            {
                installationDetails?.manifest?.platform && <div>
                    <Icons.Disc /> Installed platform
                    <div>
                        <antd.Tag>
                            {installationDetails.manifest.platform}
                        </antd.Tag>
                    </div>
                </div>
            }
            {
                installationDetails?.manifest?.paths?.mainInstallationPath && <div>
                    <Icons.Folder /> Directory
                    <div>
                        <antd.Tag>
                            {installationDetails?.manifest?.paths?.mainInstallationPath}
                        </antd.Tag>
                    </div>
                </div>
            }
        </div>
    </div>
}