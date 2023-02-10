import { constructor, DependencyContainer } from 'tsyringe/dist/typings/types'
import { RavenHooks } from '../raven/Hooks'
import { Raven } from '../raven/Raven'
import { IPlugin } from './IPlugin'

export class PluginManager {
  private readonly dependencyContainer: DependencyContainer
  private readonly hooks: RavenHooks

  constructor(raven: Raven) {
    this.dependencyContainer = raven.dependencyContainer
    this.hooks = raven.hooks
  }

  usePlugin<TPlugin extends IPlugin>(plugin: TPlugin | constructor<TPlugin>): TPlugin {
    let pluginConstruct: constructor<TPlugin>
    let pluginInstance: TPlugin | null = null

    if (typeof plugin === 'object') {
      pluginInstance = plugin
      pluginConstruct = plugin.constructor as constructor<TPlugin>
    } else if (typeof plugin === 'function') {
      pluginConstruct = plugin
    } else {
      throw new Error('Unable to resolve plugin')
    }

    if (!pluginInstance) {
      pluginInstance = this.dependencyContainer.resolve(pluginConstruct)
    }

    if (pluginInstance) {
      this.dependencyContainer.registerInstance(pluginConstruct, pluginInstance)

      pluginInstance.onRegister?.()

      this.hooks.initialize.add(async () => {
        await pluginInstance?.onInitialize?.()
      })

      this.hooks.start.add(async () => {
        await pluginInstance?.onStart?.()
      })

      this.hooks.listen.add(async () => {
        await pluginInstance?.onListen?.()
      })
    }
    return pluginInstance
  }
}
