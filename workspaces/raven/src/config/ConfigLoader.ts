import YAML from 'yaml'
import fs from 'fs'
import { RavenConfigPlugin } from './ConfigPlugin'

export class ConfigLoader {
  private readonly plugin: RavenConfigPlugin
  private readonly loaders: Record<string, Function | null> = {}

  constructor(plugin: RavenConfigPlugin) {
    this.plugin = plugin
    Object.keys(defaultLoaders).forEach((l) => (this.loaders[l] = defaultLoaders[l]))
  }

  addLoaderFunction(ext: string, loader: Function) {
    this.loaders[ext] = loader
  }

  load(path: string): any {
    const loaderKey = Object.keys(this.loaders).find((l) => path.endsWith(`.${l}`))
    const loader = loaderKey && this.loaders[loaderKey]

    if (!loader) throw new Error(`No config loader defined for ${path}`)

    const loaded = loader(path)
    if (typeof loaded === 'object') this.plugin.provider.set(loaded)
    else throw new Error(`Value could not be used as config: ${loaded}`)
  }
}

const defaultLoaders: Record<string, Function | null> = {
  json: require,
  yml: (file: string) => YAML.parse(fs.readFileSync(file, 'utf8')),
  yaml: (file: string) => YAML.parse(fs.readFileSync(file, 'utf8')),
}
