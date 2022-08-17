import { Context, Next } from "koa";

export async function ExecuteEndpointMiddleware(ctx: Context, next: Next) {
  if (ctx.endpoint) return await ctx.endpoint.handler(ctx, next);
  return await next();
}
