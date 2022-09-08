import { Context, Next } from 'koa'
import Router from 'koa-router'
import { Route } from '.'
import { getAnnotations } from './get-annotations'
import { RoutingConfig, RoutingDefinition } from './types'

export function createRouter(controller: Object): Router {
  const config = Route.GetConfig(controller)
  const routes = Route.GetRoutes(controller)

  const router = new Router(config)

  routes.forEach((route) => {
    // Inject endpoint config to context
    const endpoint = createEndpointData(route, controller, config)
    router[route.method](route.path, (ctx: Context, next: Next) => {
      ctx.endpoint = endpoint
      return next()
    })
  })

  return router
}

function createEndpointData(route: RoutingDefinition, controller: Object, config: RoutingConfig) {
  const handler =
    typeof route.handler == 'function'
      ? (route.handler as (ctx: Context) => any)
      : (ctx: Context) => (controller as any)[route.handler as string](ctx)

  const controllerAnnotations = getAnnotations(controller)

  const endpointAnnotations = typeof route.handler == 'function' ? {} : getAnnotations(controller, route.handler)

  const endpoint = {
    annotations: { ...controllerAnnotations, ...endpointAnnotations },
    route: `${config.prefix}${route.path}`.replace(/(.)\/$/, '$1'),
    handler: typeof route.handler == 'function' ? undefined : route.handler,
    name: typeof route.handler == 'function' ? undefined : `${controller.constructor.name}.${route.handler as string}`,
    controller: controller,
    execute: handler,
  }
  return endpoint
}
