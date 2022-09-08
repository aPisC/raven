import glob from 'glob'

/*const __loaders: { [key: string]: null | ((file: string) => any) } = {
  '.js': require,
  '.ts': require,
  '.d.ts': null,
  '.json': require,
  '.yml': (file: string) => YAML.parse(fs.readFileSync(file, 'utf8')),
  '.yaml': (file: string) => YAML.parse(fs.readFileSync(file, 'utf8')),
}*/

const defaultRequireMap: RequireMap = {
  '.js': require,
  '.ts': require,
  '.d.ts': null,
}

export interface RavenLoaderConfig {
  root?: string
  [key: string]: string[] | string | undefined
}

export interface ModuleEntry {
  file: string
  module: any
}

type RegisterFn = (module: any, file: string, err: Error | null) => void

interface RequireMap {
  [ext: string]: null | ((file: string) => any)
}

interface LoaderHandler {
  register: RegisterFn
  require: (fn: string) => any
}

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

      files.forEach((file) => {
        let module: any = null
        let error: Error | null = null

        try {
          module = this.loaders[section].require(file)
        } catch (err: any) {
          error = err
        }

        this.loaders[section].register(module, file, error)
      })
    })

    /*if (config.controllers?.length) {
      const controllers = this.loadModules(config.controllers, config.root)
      controllers.forEach(({ module, file }) => {
        try {
          const controller = typeof module === 'function' ? module : module.default
          if (!controller || typeof controller !== 'function') throw new Error('No suitable member exported')
          raven.useController(controller)
        } catch (err: any) {
          console.warn('Unable to load controller', file, err)
        }
      })
    }

    if (config.models?.length) {
      const models = this.loadModules(config.models, config.root)
      models.forEach(({ module, file }) => {
        try {
          const model = typeof module === 'function' ? module : module.default
          if (typeof model !== 'function') throw new Error('No suitable member exported')
          raven.useModel(model)
        } catch (err: any) {
          console.warn('Unable to load model', file, err)
        }
      })
    }

    if (config.config?.length) {
      const configs = this.loadModules(config.config, config.root)
      configs.forEach(({ module, file }) => {
        try {
          const config = module || {}
          if (typeof config !== 'object') throw new Error('No suitable config exported')
          raven.config.set(config)
        } catch (err: any) {
          console.warn('Unable to load config', file, err)
        }
      })
    }*/
  }

  /*private loadModules(globs: string[], root?: string): ModuleEntry[] {
    const modules: any[] = []
    const files = globs.flatMap((p) => glob.sync(p, { cwd: root })).map((f) => (root ? `${root}/${f}` : f))

    files.forEach((file) => {
      try {
        const module = loadFile(file)
        if (module !== false) modules.push({ module, file })
      } catch (err: any) {
        console.warn('Unable to load modul', file, err)
      }
    })

    return modules
  }*/
}

function createRequireFn(loaders: RequireMap) {
  return (file: string) => {
    const loaderName = Object.keys(loaders)
      .sort((a, b) => b.length - a.length)
      .find((ext) => file.endsWith(ext))
    const loader = loaders[loaderName || '']

    if (loader === null) return false
    if (!loader) throw new Error(`Unable to find loader for ${file}`)

    return loader(file)
  }
}
