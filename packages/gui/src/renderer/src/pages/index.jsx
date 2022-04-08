import React from "react"
import * as antd from "antd"
import * as Icons from "feather-reactjs"
import {
    useNavigate,
    useLocation,
} from "react-router-dom"

import {
    getPackages,
} from "lib"

export default (props) => {
    let navigate = useNavigate()
    let location = useLocation()

    const [packages, setPackages] = React.useState([])
    const [selectedPackage, setSelectedPackage] = React.useState(null)
    const [selectedKeyVersion, setSelectedKeyVersion] = React.useState("latest")

    const loadGlobalPackages = async () => {
        const availablePackages = await getPackages()

        setPackages(availablePackages)
    }

    const onRefresh = async () => {
        await this.loadGlobalPackages()
    }

    const onSearch = async () => {
        // TODO
    }

    const onSelectPackage = async (packageName) => {
        navigate("/package/" + packageName)
    }

    const renderListItem = (packageManifest) => {
        return <antd.List.Item
            key={packageManifest.id}
            onClick={() => onSelectPackage(packageManifest.id)}
            className="item"
        >
            <div className="icon">
                {packageManifest.icon ? <img src={packageManifest.icon} /> : <Icons.Package />}
            </div>
            <div className="info">
                <div>
                    <h2> {packageManifest.name} </h2>
                    <div className="details">
                        <div>
                            {packageManifest.author && <span>
                                <Icons.User />
                                {packageManifest.author}
                            </span>}
                        </div>
                        <div>
                            {packageManifest.versions.length > 0 && <span>
                                <Icons.Package />
                                {packageManifest.versions.length} versions
                            </span>}
                        </div>
                    </div>
                </div>
                <div>
                    <p> {packageManifest.description ?? "Package has not a description."} </p>
                </div>
            </div>
        </antd.List.Item>
    }

    React.useEffect(() => {
        loadGlobalPackages()
    }, [])

    return <div className="installer">
        <div className="actions">
            <div>
                <antd.Button
                    icon={<Icons.RefreshCw />}
                    shape="round"
                    onClick={onRefresh}
                >
                    Refresh
                </antd.Button>
            </div>
            <div>
                <antd.Input.Search
                    placeholder="Search for a package"
                    onSearch={onSearch}
                />
            </div>
        </div>
        <div className="list">
            <antd.List
                dataSource={packages}
                renderItem={renderListItem}
            />
        </div>
    </div>
}