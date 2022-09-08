import glob from 'glob'
import { defaultRequireMap } from './default-require-map'
import { LoaderHandler, RavenLoaderConfig, RegisterFn, RequireMap } from './types'

export class RavenLoader {
  private readonly loaders: { [key: string]: LoaderHandler } = {}

  useLoader(key: string, registerModule: null): void
  useLoader(key: string, registerModule: RegisterFn, requireMap?: RequireMap): void
  useLoader(key: string, registerModule: null | RegisterFn, requireMap: RequireMap = defaultRequireMap) {
    if (!registerModule) return delete this.loaders[key]

    this.loaders[key] = {
      require: createRequireFn(requireMap),
      register: registerModule,
    }
  }

  public load(config: RavenLoaderConfig) {
    const { root, ...sections } = config

    Object.keys(sections).forEach((section) => {
      if (!sections[section]) return
      if (!this.loaders[section]) throw new Error(`Loader not found for ${section}`)

      const globs: string[] =
        typeof sections[section] === 'string' ? [sections[section] as string] : (sections[section] as string[])

      const files = globs.flatMap((p) => glob.sync(p, { cwd: root })).map((f) => (root ? `${root}/${f}` : f))

      this.loadFiles(section, files)
    })
  }

  private loadFiles(type: string, files: string[]) {
    const loader = this.loaders[type]

    files.forEach((file) => {
      let module: any = null
      let error: Error | null = null

      try {
        module = loader.require(file)
        if (module === ModuleIgnoredSymbol) return
      } catch (err: any) {
        error = err
      }

      loader.register(module, file, error)
    })
  }
}

function createRequireFn(loaders: RequireMap) {
  return (file: string) => {
    const loaderName = Object.keys(loaders)
      .sort((a, b) => b.length - a.length)
      .find((ext) => file.endsWith(ext))
    const loader = loaders[loaderName || '']

    if (loader === null) return ModuleIgnoredSymbol
    if (!loader) throw new Error(`Unable to find loader for ${file}`)

    return loader(file)
  }
}

const ModuleIgnoredSymbol = Symbol('Ignored')
