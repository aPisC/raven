import { constructor, DependencyContainer } from 'tsyringe/dist/typings/types'
import { RavenHooks } from '../raven/hooks'
import { Raven } from '../raven/raven'
import { Plugin } from './plugin'

export enum PluginOrder {
  Core, // Before core components
  Default, // After sequelize initialization
  AfterKoa, // After koa initialization
}

export class PluginManager {
  private readonly dependencyContainer: DependencyContainer
  private readonly hooks: RavenHooks
  private readonly raven: Raven

  /**
   *
   */
  constructor(raven: Raven) {
    this.dependencyContainer = raven.dependencyContainer
    this.hooks = raven.hooks
    this.raven = raven
  }

  usePlugin<TPlugin extends Plugin = Plugin>(plugin: TPlugin | constructor<TPlugin> | string): TPlugin {
    let pluginName: string
    let pluginConstruct: constructor<TPlugin>
    let pluginInstance: TPlugin | null = null

    if (typeof plugin === 'string') {
      pluginName = plugin
      const pluginModule = require(plugin)
      plugin = typeof pluginModule === 'function' ? pluginModule : pluginModule.default
    }
    if (typeof plugin === 'object') {
      pluginInstance = plugin
      pluginConstruct = plugin.constructor as constructor<TPlugin>
      pluginName ??= pluginConstruct.name
    } else if (typeof plugin === 'function') {
      pluginConstruct = plugin
      pluginName ??= pluginConstruct.name
    } else {
      throw new Error('Unable to resolve plugin')
    }

    if (this.dependencyContainer.isRegistered(pluginConstruct, true))
      throw new Error(`Plugin ${pluginName} is already registered`)

    if (!pluginInstance) pluginInstance = this.dependencyContainer.resolve(pluginConstruct)

    if (!(pluginInstance instanceof Plugin)) throw new Error(`Unable to instantiate plugin`)

    this.dependencyContainer.registerInstance(pluginConstruct, pluginInstance)

    pluginInstance.onRegister(this.raven)

    this.hooks.initialize.add(async () => {
      if (!pluginInstance) return
      await pluginInstance.onInitialize(this.raven)
    })

    this.hooks.start.add(async () => {
      if (!pluginInstance) return
      await pluginInstance.onStart(this.raven)
    })

    this.hooks.listen.add(async () => {
      if (!pluginInstance) return
      await pluginInstance.onListen(this.raven)
    })

    return pluginInstance
  }
}
