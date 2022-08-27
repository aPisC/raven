import { Context, Next } from 'koa'
import { ValidationSymbol } from './createAnnotation'

export async function ValidateMiddleware(ctx: Context, next: Next) {
  const validators = ctx.endpoint?.annotations?.[ValidationSymbol] || []

  for (const validator of validators) {
    try {
      await validators(ctx)
    } catch (err) {
      throw ctx.throw(400, err as Error)
    }
  }
}
