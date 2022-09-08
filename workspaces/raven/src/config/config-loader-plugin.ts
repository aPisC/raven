import fs from 'fs'
import YAML from 'yaml'
import { Plugin } from '../plugin/plugin'
import { Raven } from '../raven/raven'

const requireMap = {
  '.js': require,
  '.ts': require,
  '.d.ts': null,
  '.json': require,
  '.yml': (file: string) => YAML.parse(fs.readFileSync(file, 'utf8')),
  '.yaml': (file: string) => YAML.parse(fs.readFileSync(file, 'utf8')),
}

export class ConfigLoaderPlugin extends Plugin {
  override onRegister(raven: Raven): void {
    raven.loader.useLoader(
      'config',
      (module, file, err) => {
        console.log(`Loading config from ${file}`)
        if (module && typeof module === 'object') return raven.config.set(module)
        if (!module) return

        console.warn(`Unable to load config from ${file}. Error: ${err}`)
      },
      requireMap
    )
  }
}
