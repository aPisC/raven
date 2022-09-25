import { ConfigSymbol } from './symbols'
import { RoutingConfig } from './types'

export function updateConfig(target: Object, config: RoutingConfig) {
  const oldConfig: RoutingConfig = Reflect.getMetadata(ConfigSymbol, target) || {}
  const newConfig = { ...oldConfig, ...config }

  Reflect.defineMetadata(ConfigSymbol, newConfig, target)
}
