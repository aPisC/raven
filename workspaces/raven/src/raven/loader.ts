import fs from 'fs'
import glob from 'glob'
import YAML from 'yaml'
import { Raven } from './raven'

const loaders: { [key: string]: null | ((file: string) => any) } = {
  '.js': require,
  '.ts': require,
  '.d.ts': null,
  '.json': require,
  '.yml': (file: string) => YAML.parse(fs.readFileSync(file, 'utf8')),
  '.yaml': (file: string) => YAML.parse(fs.readFileSync(file, 'utf8')),
}

export interface RavenLoaderConfig {
  controllers?: string[]
  models?: string[]
  config?: string[]
  root?: string
}

export interface ModuleEntry {
  file: string
  module: any
}

export class RavenLoader {
  public load(raven: Raven, config: RavenLoaderConfig) {
    if (config.controllers?.length) {
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
    }
  }

  private loadModules(globs: string[], root?: string): ModuleEntry[] {
    const modules: any[] = []
    const files = globs.flatMap((p) => glob.sync(p, { cwd: root })).map((f) => (root ? `${root}/${f}` : f))

    files.forEach((file) => {
      try {
        console.log('Loading', file)
        const module = loadFile(file)
        modules.push({ module, file })
      } catch (err: any) {
        console.warn('Unable to load modul', file, err)
      }
    })

    return modules
  }
}

function loadFile(file: string): any {
  const loaderName = Object.keys(loaders)
    .sort((a, b) => b.length - a.length)
    .find((ext) => file.endsWith(ext))
  const loader = loaders[loaderName || '']
  if (!loader) throw new Error(`Unable to find loader for ${file}`)

  return loader(file)
}
