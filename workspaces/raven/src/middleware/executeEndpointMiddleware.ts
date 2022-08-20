import { Context, Next } from "koa";

export async function ExecuteEndpointMiddleware(ctx: Context, next: Next) {
  if (ctx.endpoint?.execute) return await ctx.endpoint.execute(ctx, next);
  return await next();
}
