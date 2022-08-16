import { RoutesSymbol } from "./symbols";
import { RoutingDefinition } from "./types";

export function getRoutes(controller: Object): RoutingDefinition[] {
  const routes: RoutingDefinition[] =
    Reflect.getMetadata(RoutesSymbol, controller)?.slice() || [];
  Reflect.defineMetadata(RoutesSymbol, routes, controller);

  return routes;
}
