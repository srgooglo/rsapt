global.XMLHttpRequest = require("xhr2")
const isDev = require("electron-is-dev")

import { ipcMain, app, BrowserWindow } from "electron"
import electronStore from "electron-store"
import os from "os"
import fs from "fs"
import { join, resolve } from "path"

import setupDependencies from "./lib/setupDependencies"
import ipcHandlers from "./ipcHandlers"

class TasksController {
  constructor() {
    this.tasks = []
  }

  add(id, task) {
    if (this.tasks.find(t => t.id === id)) {
      console.warn(`Task with id ${id} already exists`)
      return false
    }

    this.tasks.push({
      id,
      task,
    })

    if (typeof win.webContents.send === "function") {
      win.webContents.send("tasks.new", id)
    }
  }

  finish(id) {
    const task = this.tasks.find(t => t.id === id)

    if (!task) {
      console.warn(`Task with id ${id} not found`)

      return false
    } else {
      this.tasks = this.tasks.filter(t => t.id !== id)

      if (typeof win.webContents.send === "function") {
        win.webContents.send("tasks.finished", id)
      }
    }
  }

  // async run(id) {
  //   for (let task of this.tasks) {
  //     await task()
  //   }
  // }
}


// private variables
const LocalManifestDB = global.LocalManifestDB = new electronStore({
  name: "local-manifest",
  cwd: app.getPath("userData"),
})

const SettingsDB = global.SettingsDB = new electronStore({
  name: "settings",
  cwd: app.getPath("userData"),
  defaults: {
    RepoServer: isDev ? "http://localhost:3010" : "https://repo.ragestudio.net",
    MainPath: resolve(os.homedir(), "rsapt"),
    DownloadThreads: 4,
    appPath: app.getPath("userData"),
  },
})

global.Tasks = new TasksController()

global.CachePath = resolve(SettingsDB.get("MainPath"), "cache")
global.InstallationsPath = resolve(SettingsDB.get("MainPath"), "installations")

global.BIN7z = (() => {
  global._7zBinExecutable = "7za.exe" // By default set for win32
  global._7zScopedDist = `${process.platform}/${process.arch}`

  switch (process.platform) {
    case "linux":
      global._7zBinExecutable = `7za`
      break
    case "darwin":
      global._7zBinExecutable = `7za`
      global._7zScopedDist = `${process.platform}`
      break
    default:
      break
  }

  return resolve(SettingsDB.get("MainPath"), "binaries/7zbin", _7zBinExecutable)
})()

// preload tasks
if (!fs.existsSync(BIN7z)) {
  setupDependencies()
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

global.defaultResolver = {
  homedir: os.homedir(),
}
global.mainWin = null
global.lastFocusedWindow = null

async function initializeMainWin() {
  mainWin = new BrowserWindow({
    nodeIntegration: true,
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
    mainWin.loadFile(join(__dirname, "../renderer/index.html"))
  } else {
    const pkg = await import("../../package.json")
    const url = `http://${pkg.env.HOST || "127.0.0.1"}:${pkg.env.PORT}`

    mainWin.loadURL(url)

    // open dev tools
    mainWin.webContents.openDevTools()
  }

  // Test active push message to Renderer-process.
  mainWin.webContents.on("did-finish-load", () => {
    mainWin?.webContents.send("main-process-message", (new Date).toLocaleString())
  })
}

app.whenReady().then(initializeMainWin)

app.on("window-all-closed", () => {
  mainWin = null

  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("second-instance", () => {
  if (mainWin) {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWin.isMinimized()) mainWin.restore()
    mainWin.focus()
  }
})

app.on("browser-window-focus", () => {
  lastFocusedWindow = BrowserWindow.getFocusedWindow()
})

ipcMain.handle("close-app", () => {
  app.quit()
})

// task manager
ipcMain.handle("tasks.get", (event, key) => {
  if (key) {
    return Tasks.tasks.find(t => t.id === key)
  }

  return Tasks.tasks
})

ipcMain.handle("tasks.has", (event, id) => {
  return Tasks.tasks.includes(id)
})

// handle all ipc handlers
Object.keys(ipcHandlers).forEach(key => {
  if (typeof ipcHandlers[key] === "function") {
    ipcMain.handle(key, async (event, ...args) => {
      let error = null
      let result = null

      try {
        result = await ipcHandlers[key](event, ...args)
      }
      catch (err) {
        error = err
      }

      return {
        error,
        result,
      }
    })
  }
})