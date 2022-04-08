import React from "react"
import * as antd from "antd"
import * as Icons from "feather-reactjs"

import "./index.less"

import {
    useParams,
    useNavigate,
} from "react-router-dom"

import {
    getPackageVersionManifest,
    getPackageData,
} from "lib"

export default () => {
    let params = useParams()
    let navigate = useNavigate()

    const [data, setData] = React.useState(null)
    const [selectedKeyVersion, setSelectedKeyVersion] = React.useState("latest")
    const [versionManifest, setVersionManifest] = React.useState(null)

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
        // fetch manifest data
        const result = await getPackageVersionManifest(params.id, version).catch(error => {
            console.error(error)
            antd.message.error("Failed to load package version manifest")

            return false
        })

        if (result) {
            setSelectedKeyVersion(version)
            setVersionManifest(result)
        }
    }

    const onClickInstall = async () => {
        if (!versionManifest) {
            console.error(`Cannot make installation, no version manifest available`)
            antd.message.error(`Failed to install package [no version manifest available]`)
            return false
        }

        await window.app.makeInstallation(versionManifest).catch((error) => {
            antd.message.error(`Failed to install package [${error}]`)
        })
    }

    React.useEffect(() => {
        loadPackageData()
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
        <div>
            {JSON.stringify(versionManifest)}
        </div>
        <div>
            <antd.Button
                type="primary"
                icon={<Icons.DownloadCloud />}
                onClick={onClickInstall}
                disabled={!versionManifest}
            >
                Install
            </antd.Button>
        </div>
    </div>
}