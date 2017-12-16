import path from "path"

const { remote } = window.require("electron")
const fs = remote.require("fs")

export default class {
  constructor() {
    this.path = path.join(remote.app.getPath("userData"), "config.json")

    try {
      const json = fs.readFileSync(this.path, "utf-8")
      this.cache = JSON.parse(json)
    } catch (e) {
      console.error(e)
      this.cache = {}
    }
  }

  _saveCache() {
    fs.writeFileSync(this.path, JSON.stringify(this.cache))
  }

  set(key, obj) {
    this.cache[key] = obj
    this._saveCache()
  }

  get(key) {
    return this.cache[key]
  }

  clear() {
    this.cache = {}
    this._saveCache()
  }
}