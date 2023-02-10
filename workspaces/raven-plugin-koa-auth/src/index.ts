import KoaJwt from 'koa-jwt'
import { Plugin } from 'raven'
import { MiddlewarePriority, RavenKoaPlugin } from 'raven-plugin-koa'
import { injectable } from 'tsyringe'
import { AuthMiddleware } from './authMiddleware'
import { Authorize, RequireScope } from './Decorators'
import AuthService from './authService'

@injectable()
export default class RavenJWTAuthPlugin extends Plugin {
  override onInitialize(): void {
    const secret: string = this.config.getRequired('secret')
    const passthrough: boolean = this.config.get('blockWithoutToken', true)
    const defaultAuthorized: boolean = this.config.get('defaultAuthorized', false)

    this.raven.dependencyContainer
      .resolve(RavenKoaPlugin)
      .useKoaMiddleware(MiddlewarePriority.PostIngress, KoaJwt({ secret, passthrough: passthrough }))
      .useMiddleware(MiddlewarePriority.PostRouting, new AuthMiddleware(defaultAuthorized))

    this.raven.useService(AuthService, new AuthService(secret))
  }
}

export { AuthService, Authorize, RequireScope, RavenJWTAuthPlugin }
