import { RoutesSymbol } from './symbols'
import { HttpMethod, RoutingDefinition } from './types'

export function addRoute(target: Object, method: HttpMethod, path: string, handler: string | symbol | (() => any)) {
  const routes: RoutingDefinition[] = Reflect.getMetadata(RoutesSymbol, target) || []

  const newRoutes = [
    ...routes,
    {
      path,
      method,
      handler: handler,
    },
  ]

  Reflect.defineMetadata(RoutesSymbol, newRoutes, target)
}
