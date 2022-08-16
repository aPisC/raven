export type HttpMethod = "get" | "post" | "put" | "del" | "all";

export interface RoutingDefinition {
  method: HttpMethod;
  handler: string | symbol | (() => any);
  path: string;
}

export interface RoutingConfig {
  prefix?: string;
}
