import { Context, Middleware, Next } from 'raven'
import { AuthorizeSymbol } from './authorize'

export class AuthMiddleware extends Middleware {
  constructor(private defaultAuthorized: boolean) {
    super()
  }

  protected execute(ctx: Context, next: Next) {
    if (ctx.state.jwtOriginalError && ctx.state.jwtOriginalError.message != 'jwt must be provided')
      ctx.throw(400, ctx.state.jwtOriginalError)

    const authorize: boolean | null = ctx.endpoint?.annotations?.[AuthorizeSymbol]
    if (authorize || (authorize == null && this.defaultAuthorized)) {
      if (!ctx.state.user) ctx.throw(400, 'jwt must be provided')
    }

    return next()
  }
}
