import { RavenSequelizePlugin } from './Plugin'

export class FileLoader {
  private readonly plugin: RavenSequelizePlugin
  private readonly loaders: Array<[string, Function | null]> = []

  constructor(plugin: RavenSequelizePlugin) {
    this.plugin = plugin
    defaultLoaders.forEach(([k, l]) => this.loaders.push([k, l]))
  }

  addLoaderFunction(ext: string, loader: Function) {
    this.loaders.unshift([ext, loader])
  }

  load(path: string): any {
    const loader = this.loaders.find(([k]) => path.endsWith(`.${k}`))?.[1]

    if (!loader) throw new Error(`No model loader defined for ${path}`)

    const loaded = loader(path)
    if (typeof loaded === 'object' || typeof loaded.default === 'function') this.plugin.useModel(loaded.default)
    else if (typeof loaded === 'function') this.plugin.useModel(loaded)
    else throw new Error(`Value could not be used as model constructor: ${loaded}`)
  }
}

const defaultLoaders: Array<[string, Function | null]> = [
  ['d.ts', null],
  ['ts', require],
  ['js', require],
]
