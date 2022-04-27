import React from "react"
import * as antd from "antd"
import * as Icons from "feather-reactjs"

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
    const [selectedKeyVersion, setSelectedKeyVersion] = React.useState("latest")
    const [versionManifest, setVersionManifest] = React.useState(null)

    const checkIsInstalled = async () => {
        let isInstalled = await window.app.checkInstallation(params.id)
        setIsInstalled(isInstalled)

        return isInstalled
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

    const onSelectVersion = async (version) => {
        if (!data) {
            console.error("No package data")
            antd.message.error("Failed to load package manifest")
            return false
        }

        const versionManifest = data.manifests.find(manifest => manifest.version === version)

        if (!versionManifest) {
            console.error("No version manifest available")
            antd.message.error("Version not matched")

            return false
        }

        setSelectedKeyVersion(version)
        setVersionManifest(versionManifest)
    }

    const onClickInstall = async () => {
        if (!versionManifest) {
            console.error(`Cannot make installation, no version manifest available`)
            antd.message.error(`Failed to install package [no version manifest available]`)
            return false
        }

        await window.app.makeInstallation(data.id, selectedKeyVersion).catch((error) => {
            antd.message.error(`Failed to install package [${error}]`)
        })

        await checkIsInstalled()
    }

    const onClickUninstall = async () => {
        await window.app.uninstallPackage(params.id).catch((error) => {
            antd.message.error(`Failed to uninstall package [${error.message}]`)
        })

        await checkIsInstalled()
    }

    const onClickOpenDir = async () => {
        console.log(params.id)

        await window.app.openInstallationDir(params.id).catch((error) => {
            antd.message.error(`Failed to open installation directory [${error.message}]`)
        })
    }

    React.useEffect(() => {
        loadPackageData()
        checkIsInstalled()
    }, [])

    if (!data) {
        return <antd.Skeleton active />
    }

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

        <div>
            <h3><Icons.Tag />Select version</h3>
            <antd.Select
                onChange={(value) => onSelectVersion(value)}
                value={selectedKeyVersion}
            >
                {
                    data.versions.map(version => {
                        return <antd.Select.Option
                            key={version}
                            value={version}
                        >
                            {version}
                        </antd.Select.Option>
                    })
                }
            </antd.Select>
        </div>
        <div className="actions">
            {isInstalled ? <div>
                <antd.Button
                    type="danger"
                    icon={<Icons.X />}
                    onClick={onClickUninstall}
                >
                    Uninstall
                </antd.Button>
            </div> : <div>
                <antd.Button
                    type="primary"
                    icon={<Icons.DownloadCloud />}
                    onClick={onClickInstall}
                    disabled={!versionManifest}
                >
                    Install
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
    </div>
}