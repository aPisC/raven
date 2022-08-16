import { getRoutes } from "./getRoutes";
import { HttpMethod } from "./types";

export function addRoute(
  target: Object,
  method: HttpMethod,
  path: string,
  handler: string | symbol | (() => any)
) {
  const routes = getRoutes(target);

  routes.push({
    path,
    method,
    handler: handler,
  });
}
