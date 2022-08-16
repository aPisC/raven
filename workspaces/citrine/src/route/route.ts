import { addRoute } from "./addRoute";
import { createRouter } from "./createRouter";
import { decorateRoute } from "./decorateRoute";
import { getRoutes } from "./getRoutes";
import { HttpMethod } from "./types";

export const Route = {
  // Method decorators
  Get: (path?: string) => decorateRoute("get", path),
  Post: (path?: string) => decorateRoute("post", path),
  Put: (path?: string) => decorateRoute("put", path),
  Delete: (path?: string) => decorateRoute("del", path),

  // Helper functions
  AddRoute: (
    controller: Object,
    method: HttpMethod,
    path: string,
    handler: () => any
  ) => addRoute(controller, method, path, handler),
  GetRoutes: getRoutes,
  CreateRouter: createRouter,
  Decorate: decorateRoute,
};
