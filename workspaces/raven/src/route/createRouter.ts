import Router from "koa-router";
import { Route } from "./route";

export function createRouter(controller: Object): Router {
  const config = Route.GetConfig(controller);
  const routes = Route.GetRoutes(controller);

  const router = new Router(config);

  routes.forEach((route) => {
    switch (typeof route.handler) {
      case "function":
        router[route.method](route.path, route.handler as () => any);
        break;
      default:
        router[route.method](route.path, (ctx) =>
          (controller as any)[route.handler as string](ctx)
        );
        break;
    }
  });

  return router;
}
