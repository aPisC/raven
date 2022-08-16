import { ConfigSymbol } from "./symbols";
import { RoutingConfig } from "./types";

export function setConfig(
  target: Object,
  key: keyof RoutingConfig,
  value: RoutingConfig[typeof key]
) {
  const config: RoutingConfig = Reflect.getMetadata(ConfigSymbol, target) || {};
  const newConfig = { ...config, [key]: value };

  Reflect.defineMetadata(ConfigSymbol, newConfig, target);
}
