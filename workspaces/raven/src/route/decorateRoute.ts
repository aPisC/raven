import { addRoute } from "./addRoute";
import { HttpMethod } from "./types";

export function decorateRoute(method: HttpMethod, path?: string) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
  ): void {
    if (!path) path = `/${String(propertyKey)}`;
    addRoute(target, method, path, propertyKey);
  };
}
