import { constructor } from 'tsyringe/dist/typings/types'
import { Plugin } from '../plugin/plugin'
import { createAnnotation } from './createAnnotation'

export function pluginInitializedValidator(plugin: constructor<Plugin>) {
  const cache = { success: false }
  return createAnnotation((ctx, raven) => {
    if (cache.success) return
    if (!raven.dependencyContainer.isRegistered(plugin)) {
      console.error(`${plugin.name} is not initialized`)
      throw new Error(`${plugin.name} is not initialized`)
    }
    cache.success = true
  })
}
