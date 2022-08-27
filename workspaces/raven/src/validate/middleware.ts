import { Context, Next } from 'koa'
import { ValidationSymbol } from './createAnnotation'

export async function ValidateMiddleware(ctx: Context, next: Next) {
  const validators = ctx.endpoint?.annotations?.[ValidationSymbol] || []

  for (const validator of validators) {
    try {
      await validator(ctx)
    } catch (err) {
      throw ctx.throw(400, err as Error)
    }
  }
  return await next()
}
