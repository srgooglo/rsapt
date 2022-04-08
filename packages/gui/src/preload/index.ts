import fs from "fs"
import path from "path"
import os from "os"
import { contextBridge, ipcRenderer } from "electron"
import { domReady } from "./utils"
import { useLoading } from "./loading"
import packagejson from "../../package.json"

const originURI = "http://localhost:3010"

const DataPath = path.resolve(os.homedir(), "memesis")
const CachePath = path.resolve(DataPath, "cache")
const InstallationsPath = path.resolve(DataPath, "versions")

const isDev = process.env.NODE_ENV === "development"


// ---------------------------------------------------

contextBridge.exposeInMainWorld("bridge", {
  __dirname,
  __filename,
  fs,
  path,
  ipcRenderer: withPrototype(ipcRenderer),
  http: require("http"),
  https: require("https"),
  closeApp: () => {
    ipcRenderer.invoke("close-app")
  },
  originURI,
  DataPath,
  CachePath,
  InstallationsPath,
  packagejson: packagejson,
})

// `exposeInMainWorld` can not detect `prototype` attribute and methods, manually patch it.
function withPrototype(obj: Record<string, any>) {
  const protos = Object.getPrototypeOf(obj)

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue

    if (typeof value === "function") {
      // Some native API not work in Renderer-process, like `NodeJS.EventEmitter["on"]`. Wrap a function patch it.
      obj[key] = function (...args: any) {
        return value.call(obj, ...args)
      }
    } else {
      obj[key] = value
    }
  }
  return obj
}
