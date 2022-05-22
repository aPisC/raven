export type HttpMethod = "get" | "post" | "put" | "del" | "all";

export interface RoutingDefinition {
  method: HttpMethod;
  handler: string | symbol;
  path: string;
  enableMapper: boolean;
  enableValidator: boolean;
  returnJson: boolean;
}

export interface RoutingOptions {
  enableMapper?: boolean;
  enableValidator?: boolean;
  returnJson?: boolean;
}
