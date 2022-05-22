import Koa from "koa";

export async function ReturnJson(ctx: Koa.Context, next: Koa.Next) {
  const response = await next();

  if (ctx.response.body == null && response != null) {
    ctx.response.body = response;
    ctx.status = 200;
  } else if (ctx.response.body == null) {
    ctx.throw("Not found", 404);
  }
}
