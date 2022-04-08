global.XMLHttpRequest = require('xhr2')

import { ipcMain, app, BrowserWindow } from "electron"
import electronStore from "electron-store"
import os from "os"
import fs from "fs"
import { join, resolve } from "path"

import ipcHandlers from "./ipcHandlers"

// private variables
const LocalManifestDB = global.LocalManifestDB = new electronStore({
  name: "local-manifest",
  cwd: app.getPath("userData"),
})

const SettingsDB = global.SettingsDB = new electronStore({
  name: "settings",
  cwd: app.getPath("userData"),
  defaults: {
    RepoServer: "https://repo.ragestudio.net",
    MainPath: resolve(os.homedir(), "rsapt"),
    DownloadThreads: 4
  },
})

const CachePath = global.CachePath = resolve(SettingsDB.get("MainPath"), "cache")
const InstallationsPath = global.InstallationsPath = resolve(SettingsDB.get("MainPath"), "installations")
const BIN7z = global.BIN7z = resolve(SettingsDB.get("MainPath"), "binaries/7zbin")

let _7zBinExecutable = global._7zBinExecutable = "7za.exe" // By default set for win32
let _7zScopedDist = global._7zScopedDist = `${process.platform}/${process.arch}`

switch (process.platform) {
  case "linux":
    _7zBinExecutable = `7za`
    break
  case "darwin":
    _7zBinExecutable = `7za`
    _7zScopedDist = `${process.platform}`
    break
  default:
    break
}

if (fs.existsSync(global.CachePath)) {
  fs.rmdirSync(global.CachePath, { recursive: true })
}

const isWin7 = os.release().startsWith("6.1")
if (isWin7) app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win = null

async function mainWin() {
  win = new BrowserWindow({
    title: "RepoManager",
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs")
    },
    frame: false,

    maxWidth: 1000,

    minWidth: 600,
    minHeight: 300,

    width: 800,
    height: 500,

    resizable: true,
    maximizable: false,
  })

  if (app.isPackaged) {
    win.loadFile(join(__dirname, "../renderer/index.html"))
  } else {
    const pkg = await import("../../package.json")
    const url = `http://${pkg.env.HOST || "127.0.0.1"}:${pkg.env.PORT}`

    win.loadURL(url)
  }

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (new Date).toLocaleString())
  })
}

app.whenReady().then(mainWin)

app.on("window-all-closed", () => {
  win = null
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("second-instance", () => {
  if (win) {
    // Someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

ipcMain.handle("close-app", () => {
  app.quit()
})

Object.keys(ipcHandlers).forEach(key => {
  if (typeof ipcHandlers[key] === "function") {
    ipcMain.handle(key, async (event, ...args) => {
      try {
        return await ipcHandlers[key](event, ...args)
      } catch (err) {
        console.error(err)
        return err
      }
    })
  }
})