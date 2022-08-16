import Router from "koa-router";
import { kebabize } from "../utils/kebabize";
import { Route } from "./route";

export function createRouter(controller: Object): Router {
  const defaultRouterOptions = createDefaultConfiguration(controller);
  const routes = Route.GetRoutes(controller);

  console.log(routes);

  const router = new Router(defaultRouterOptions);

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

function createDefaultConfiguration(controller: Object): Router.IRouterOptions {
  return {
    //prefix: "/", //`/${resolveControllerPath(controller)}`,
  };
}

function resolveControllerPath(controller: Object) {
  let name = controller.constructor.name;
  if (name.endsWith("Controller")) name = name.substring(0, name.length - 10);
  return `/${kebabize(name)}`;
}
