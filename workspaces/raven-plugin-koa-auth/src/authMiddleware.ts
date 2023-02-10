import { Middleware } from 'raven-plugin-koa'
import { AuthData } from './authService'
import { AuthorizeSymbol, RequireScopeSymbol } from './Decorators'

export class AuthMiddleware extends Middleware {
  constructor(private defaultAuthorized: boolean) {
    super()
  }

  protected execute(ctx: any, next: Function) {
    if (ctx.state.jwtOriginalError && ctx.state.jwtOriginalError.message != 'jwt must be provided')
      ctx.throw(400, ctx.state.jwtOriginalError)

    const user: AuthData | undefined = ctx.state.user
    const scopes = user?.scopes ?? []
    const authorize: boolean | null = ctx.endpoint?.annotations?.[AuthorizeSymbol]
    const requireScope = ctx.endpoint?.annotations?.[RequireScopeSymbol]

    if (requireScope || authorize || (authorize == null && this.defaultAuthorized)) {
      if (!user) return ctx.throw(400, 'jwt must be provided')
      if (requireScope && !scopes.includes(requireScope)) return ctx.throw(401, `not authorized to ${requireScope}`)
    }

    return next()
  }
}
