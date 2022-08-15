import { RoutingSymbol } from "./routing.symbol";
import { RoutingOptions, HttpMethod, RoutingDefinition } from "./routing.types";

function RoutingDecorator(
  method: HttpMethod,
  path?: string,
  options: RoutingOptions = defaultOptions
): MethodDecorator {
  return function <T>(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): void {
    /* // Apply validation and mapper decorators
    if (options.enableValidator)
      Validate.Apply()(target, propertyKey, descriptor);
    if (options.enableMapper) Map.Apply()(target, propertyKey, descriptor);
    */

    if (!path) path = `/${String(propertyKey)}`;

    const routes: RoutingDefinition[] =
      Reflect.getMetadata(RoutingSymbol, target)?.slice() || [];
    Reflect.defineMetadata(RoutingSymbol, routes, target);

    routes.push({
      path,
      method,
      handler: propertyKey,
      enableMapper: !!options.enableMapper,
      enableValidator: !!options.enableValidator,
      returnJson: !!options.returnJson,
    });
  };
}

const defaultOptions: RoutingOptions = {
  enableMapper: true,
  enableValidator: true,
  returnJson: true,
};
