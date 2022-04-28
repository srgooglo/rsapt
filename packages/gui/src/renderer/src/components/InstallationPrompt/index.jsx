import React from "react"
import * as antd from "antd"
import * as Icons from "feather-reactjs"

import "./index.less"

export default (props) => {
    if (typeof props.package !== "object") {
        console.warn("Package is not an object.")

        return <div>
            <h1>
                <Icons.AlertTriangle />
                <span>
                    Invalid Package
                </span>
            </h1>
        </div>
    }

    const [selectedKeyVersion, setSelectedKeyVersion] = React.useState("latest")
    const [versionManifest, setVersionManifest] = React.useState(null)

    const onSelectVersion = async (version) => {
        const versionManifest = props.package.manifests.find(manifest => manifest.version === version)

        if (!versionManifest) {
            console.error("No version manifest available")
            antd.message.error("Version not matched")

            return false
        }

        setSelectedKeyVersion(version)
        setVersionManifest(versionManifest)
    }

    const makeInstall = async () => {
        if (!versionManifest) {
            console.error(`Cannot make installation, no version manifest available`)
            antd.message.error(`Failed to install package [no version manifest available]`)
            return false
        }

        window.app.makeInstallation(props.package.id, selectedKeyVersion)

        props.close()
    }

    const onClickClose = () => {
        props.close()
    }

    return <div className="installationPrompt">
        <div className="details">
            <div>
                <h4>
                    <Icons.Package />
                    Package ID
                </h4>
                <antd.Tag>
                    {props.package.id}
                </antd.Tag>
            </div>
            <div>
                <h4>
                    <Icons.Download />
                    Download size
                </h4>
                <div>
                    <antd.Tag>
                        999.99 TB
                    </antd.Tag>
                </div>
            </div>
            <div>
                <h4>
                    <Icons.Folder />
                    Installation directory
                </h4>
                <div>
                    <antd.Tag>
                        {app.config.MainPath}/installations/{props.package.id}
                    </antd.Tag>
                </div>
            </div>
        </div>

        <div className="actions">
            <div>
                <h4>Select version</h4>
                <antd.Select
                    onChange={(value) => onSelectVersion(value)}
                    value={selectedKeyVersion}
                >
                    {
                        props.package.versions.map(version => {
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
            <div className="buttons">
                <div>
                    <antd.Button
                        type="primary"
                        disabled={!versionManifest}
                        onClick={makeInstall}
                    >
                        <Icons.Download />
                        Install
                    </antd.Button>
                </div>
                <div>
                    <antd.Button
                        onClick={onClickClose}
                    >
                        <Icons.X />
                        Cancel
                    </antd.Button>
                </div>
            </div>
        </div>
    </div>
}