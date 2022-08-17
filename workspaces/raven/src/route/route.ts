import { addRoute } from "./addRoute";
import { annotateEndpoint } from "./annotateEndpoint";
import { createRouter } from "./createRouter";
import { decorateRoute } from "./decorateRoute";
import { getConfig } from "./getConfig";
import { getRoutes } from "./getRoutes";
import { HttpMethod } from "./types";
import { updateConfig } from "./updateConfig";

export const Route = {
  // Method decorators
  Get: (path?: string) => decorateRoute("get", path),
  Post: (path?: string) => decorateRoute("post", path),
  Put: (path?: string) => decorateRoute("put", path),
  Delete: (path?: string) => decorateRoute("del", path),

  // Config decorators
  Prefix: (path: string) => (target: Function) =>
    updateConfig(target.prototype, { prefix: path }),

  // Helper functions
  Annotate: annotateEndpoint,
  AddRoute: (
    controller: Object,
    method: HttpMethod,
    path: string,
    handler: () => any
  ) => addRoute(controller, method, path, handler),
  GetRoutes: getRoutes,
  Configure: updateConfig,
  GetConfig: getConfig,
  CreateRouter: createRouter,
  Decorate: decorateRoute,
};
