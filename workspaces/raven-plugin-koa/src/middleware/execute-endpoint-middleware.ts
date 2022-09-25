import { Context, Next } from 'koa'

export async function ExecuteEndpointMiddleware(ctx: Context, next: Next) {
  if (ctx.endpoint?.execute) {
    const response = await ctx.endpoint.execute(ctx, next)

    if (response === null) {
      ctx.throw(404, 'Not found')
    } else if (response != null) {
      ctx.response.body = response
      ctx.status = 200
    }

    return
  }

  return await next()
}
