import React from "react"
import * as antd from "antd"
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom"

import { CreateEviteApp } from "evite"
import * as Icons from "feather-reactjs"

import InstallerPage from "./pages"
import PackagePage from "./pages/package"
import LibraryPage from "./pages/library"

import "antd/dist/antd.dark.less"
import "./index.less"

class App extends React.Component {
  onClickCloseApp = () => {
    window.bridge.closeApp()
  }

  render() {
    return <BrowserRouter>
      <header>
        <div className="nav">
          <div>
            <Link to="/">
              <Icons.Home /> Main
            </Link>
          </div>
          <div>
            <Link to="/library">
              <Icons.Book /> Library
            </Link>
          </div>
        </div>
        <div className="appControls">
          <div className="icon" onClick={this.onClickCloseApp}>
            <Icons.XCircle style={{ margin: 0 }} />
          </div>
        </div>
      </header>
      <div className="App">
        <Routes>
          <Route path="/" element={<InstallerPage />} />
          <Route path="/package/:id" element={<PackagePage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </div>
      <footer>
        <div>
          <span>
            <Icons.Server /> {window.bridge.originURI}
          </span>
        </div>
        <div>
          <span>
            <Icons.Package /> v {window.bridge.packagejson.version ?? "experimental"}
          </span>
        </div>
        <div>
          <Link to="/settings">
            <span>
              <Icons.Settings /> Settings
            </span>
          </Link>
        </div>
      </footer>
    </BrowserRouter>
  }
}

export default CreateEviteApp(App)

window.bridge.ipcRenderer.on("main-process-message", (_event, ...args) => {
  console.log("[Receive Main-process message]:", ...args)
})
