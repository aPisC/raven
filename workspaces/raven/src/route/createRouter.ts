import { Context, Next } from "koa";
import Router from "koa-router";
import { getAnnotations } from "./getAnnotations";
import { Route } from "./route";

export function createRouter(controller: Object): Router {
  const config = Route.GetConfig(controller);
  const routes = Route.GetRoutes(controller);

  const router = new Router(config);

  routes.forEach((route) => {
    const handler =
      typeof route.handler == "function"
        ? (route.handler as (ctx: Context) => any)
        : (ctx: Context) => (controller as any)[route.handler as string](ctx);

    const endpointAnnotations =
      typeof route.handler == "function"
        ? {}
        : getAnnotations(controller, route.handler);

    const endpoint = {
      annotations: endpointAnnotations,
      controller: controller,
      handler: handler,
    };

    router[route.method](route.path, (ctx: Context, next: Next) => {
      ctx.endpoint = endpoint;
      return next();
    });
  });

  return router;
}
