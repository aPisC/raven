import { addRoute } from "./addRoute";
import { HttpMethod } from "./types";

export function decorateRoute(
  method: HttpMethod,
  path?: string
): MethodDecorator {
  return function <T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): void {
    if (!path) path = `/${String(propertyKey)}`;
    addRoute(target, method, path, propertyKey);
  };
}
