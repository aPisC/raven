import 'reflect-metadata'

import { container as globalDependencyContainer, injectable } from 'tsyringe'
import { constructor } from 'tsyringe/dist/typings/types'
import { ConfigLoaderPlugin } from '../config/config-loader-plugin'
import { ConfigObjectProvider } from '../config/config-object-provider'
import { ConfigProvider } from '../config/config-provider'
import { RavenLoader } from '../loader/loader'
import { RavenLoaderConfig } from '../loader/types'
import { Plugin } from '../plugin/plugin'
import { PluginManager } from '../plugin/plugin-manager'
import { RavenHooks } from './hooks'

@injectable()
export class Raven {
  public readonly config: ConfigProvider = new ConfigObjectProvider()
  public readonly hooks: RavenHooks = new RavenHooks(this)
  public readonly loader: RavenLoader = new RavenLoader()

  private readonly pluginManager: PluginManager

  public readonly dependencyContainer = globalDependencyContainer.createChildContainer()

  constructor() {
    this.pluginManager = new PluginManager(this)

    this.pluginManager.usePlugin(new ConfigLoaderPlugin())

    // Register dependency instances
    this.dependencyContainer.register(Raven, { useFactory: () => this })
  }

  useService<T extends Object>(ctor: constructor<T>, service?: T | (() => T)) {
    if (!service) this.dependencyContainer.register(ctor, ctor)
    else if (typeof service === 'function') this.dependencyContainer.register(ctor, { useFactory: service as () => T })
    else if (typeof service === 'object') this.dependencyContainer.registerInstance(ctor, service)
    else throw new Error('Unable to register service')
  }

  usePlugin<TPlugin extends Plugin = Plugin>(plugin: TPlugin | constructor<TPlugin> | string): TPlugin {
    return this.pluginManager.usePlugin(plugin)
  }

  loadFiles(config: RavenLoaderConfig) {
    this.loader.load(config)
  }

  async start() {
    // Run init and startup hooks
    await this.hooks.initialize.execute()
    await this.hooks.start.execute()
    await this.hooks.listen.execute()
  }
}
