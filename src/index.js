const filesystem = require("corenode/dist/filesystem")
const axios = require("axios")

const CliGui = require('cligui2')
const gui = new CliGui()


const testDb = [
  
]


gui.checklist("A is checked on by default",[
    {
      name: "a",
      checked: true,
      call: function(main) {}
    },
    {
      name: "b",
      call: function(main) {}
    }
  ])