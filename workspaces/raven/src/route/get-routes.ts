import { RoutesSymbol } from "./symbols";
import { RoutingDefinition } from "./types";

export function getRoutes(
  controller: Object
): ReadonlyArray<RoutingDefinition> {
  const routes: RoutingDefinition[] =
    Reflect.getMetadata(RoutesSymbol, controller) || [];
  Reflect.defineMetadata(RoutesSymbol, routes, controller);

  return routes;
}
