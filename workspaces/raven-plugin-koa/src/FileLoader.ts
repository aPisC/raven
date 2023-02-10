import { RavenKoaPlugin } from './Plugin'

export class FileLoader {
  private readonly plugin: RavenKoaPlugin
  private readonly loaders: Array<[string, Function | null]> = []

  constructor(plugin: RavenKoaPlugin) {
    this.plugin = plugin
    defaultLoaders.forEach(([k, l]) => this.loaders.push([k, l]))
  }

  addLoaderFunction(ext: string, loader: Function) {
    this.loaders.unshift([ext, loader])
  }

  load(path: string): any {
    const loader = this.loaders.find(([k]) => path.endsWith(`.${k}`))?.[1]

    if (!loader) throw new Error(`No controller loader defined for ${path}`)

    const loaded = loader(path)
    if (typeof loaded === 'object' || typeof loaded.default === 'function') this.plugin.useController(loaded.default)
    else if (typeof loaded === 'function') this.plugin.useController(loaded)
    else throw new Error(`Value could not be used as controller constructor: ${loaded}`)
  }
}

const defaultLoaders: Array<[string, Function | null]> = [
  ['d.ts', null],
  ['ts', require],
  ['js', require],
]
