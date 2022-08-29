import { ConfigSymbol } from "./symbols";
import { RoutingConfig } from "./types";

export function getConfig(controller: Object): Readonly<RoutingConfig> {
  const config: RoutingConfig =
    Reflect.getMetadata(ConfigSymbol, controller) || {};
  Reflect.defineMetadata(ConfigSymbol, config, controller);

  return config;
}
