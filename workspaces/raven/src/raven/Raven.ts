import 'reflect-metadata'

import { container as globalDependencyContainer, injectable } from 'tsyringe'
import { constructor } from 'tsyringe/dist/typings/types'
import { RavenConfigPlugin } from '../config/ConfigPlugin'
import { RavenLoader, RavenLoaderConfig } from '../loader/Loader'
import { Plugin } from '../plugin/Plugin'
import { PluginManager } from '../plugin/PluginManager'
import { RavenHooks } from './Hooks'

@injectable()
export class Raven {
  public readonly hooks: RavenHooks = new RavenHooks(this)
  public readonly loader: RavenLoader = new RavenLoader()

  private readonly pluginManager: PluginManager

  public readonly dependencyContainer = globalDependencyContainer.createChildContainer()

  constructor() {
    this.pluginManager = new PluginManager(this)

    this.pluginManager.usePlugin(new RavenConfigPlugin(this))

    // Register dependency instances
    this.dependencyContainer.register(Raven, { useFactory: () => this })
  }

  useService<T extends Object>(ctor: constructor<T>, service?: T | (() => T)) {
    if (!service) this.dependencyContainer.register(ctor, ctor)
    else if (typeof service === 'function') this.dependencyContainer.register(ctor, { useFactory: service as () => T })
    else if (typeof service === 'object') this.dependencyContainer.registerInstance(ctor, service)
    else throw new Error('Unable to register service')
  }

  usePlugin<TPlugin extends Plugin = Plugin>(plugin: TPlugin | constructor<TPlugin>): TPlugin {
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

  resolve<T>(ctor: constructor<T>): T {
    return this.dependencyContainer.resolve(ctor)
  }

  configure(config: Record<string, any>) {
    this.resolve(RavenConfigPlugin).provider.set(config)
  }
}
