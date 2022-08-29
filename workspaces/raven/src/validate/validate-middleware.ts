import { Context, Next } from 'koa'
import { Raven } from '../raven/raven'
import { ValidationSymbol, ValidatorFn } from './create-annotation'

export function ValidateMiddleware(raven: Raven) {
  return async (ctx: Context, next: Next) => {
    const validators: ValidatorFn[] = ctx.endpoint?.annotations?.[ValidationSymbol] || []

    for (const validator of validators) {
      try {
        await validator(ctx, raven)
      } catch (err) {
        throw ctx.throw(400, err as Error)
      }
    }
    return await next()
  }
}
