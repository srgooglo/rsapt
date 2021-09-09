const path = require('path')
const fs = require('fs')

const cloudlink = require("@ragestudio/cloudlink")
const StormDB = require("stormdb")

const manifestsDBFilepath = path.resolve(process.cwd(), 'manifests.db')

class Manifest {
    constructor(payload) {
        this.payload = payload
        this.data = null
    }
    
    static get() {
        return 
    }

    delete = () => {

    }

    save = async () => {

    }
}


class Server {
    constructor() {
        this.endpoints = [
            {
                method: "GET",
                route: "/manifests",
                controller: this.controllers.getAllManifests
            }
        ]
        
        this.server = new cloudlink.Server({
            endpoints: this.endpoints
        }) 

        this.manifestDbEngine = new StormDB.localFileEngine(manifestsDBFilepath)
        this.manifestDb = new StormDB(this.manifestDbEngine)
        this.manifestDb.default({ manifests: [] })
        this.server.init()
    }

    controllers = {
        getAllManifests: (req, res, next) => {
            const data = this.manifestDb.get("manifests").value()

            return res.json(data)
        }
    }
   
}

new Server()