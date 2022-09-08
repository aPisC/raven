import 'reflect-metadata'

import { container as globalDependencyContainer, injectable } from 'tsyringe'
import { constructor } from 'tsyringe/dist/typings/types'
import { ConfigObjectProvider } from '../config/config-object-provider'
import { ConfigProvider } from '../config/config-provider'
import { ConfigLoaderPlugin } from '../core/config-loader-plugin'
import { Plugin } from '../plugin/plugin'
import { PluginManager } from '../plugin/plugin-manager'
import { RavenHooks } from './hooks'
import { RavenLoader, RavenLoaderConfig } from './loader'

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

  /**
   * Dependency registration
   */
  /*useKoaMiddleware(priority: MiddlewarePriority, middleware: KoaMiddleware) {
    this.koa.useKoaMiddleware(priority, middleware)
  }

  useMiddleware(priority: MiddlewarePriority, middleware: constructor<Middleware>): void
  useMiddleware(priority: MiddlewarePriority, middleware: Middleware): void
  useMiddleware(priority: MiddlewarePriority, middleware: FactoryProvider<Middleware>): void
  useMiddleware(priority: MiddlewarePriority, middleware: any) {
    this.koa.useMiddleware(priority, middleware)
  }*/

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

  /*useSequelize(): SequelizePlugin {
    return this.pluginManager.usePlugin(new SequelizePlugin(this))
  }*/

  async start() {
    // Run init and startup hooks
    await this.hooks.initialize.execute()
    await this.hooks.start.execute()
    await this.hooks.listen.execute()
  }
}
