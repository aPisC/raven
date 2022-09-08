import KoaJwt from 'koa-jwt'
import { KoaPlugin, MiddlewarePriority, Plugin, Raven } from 'raven'
import { AuthMiddleware } from './authMiddleware'
import { Authorize } from './authorize'
import AuthService from './authService'

const SETTINGS_ROOT = 'plugins.raven-plugin-auth'

interface RavenAuthPluginConfiguration {
  secret: string
  blockWithoutToken: boolean
  defaultAuthorized: boolean
}

export default class RavenPluginAuth extends Plugin<RavenAuthPluginConfiguration> {
  override onInitialize(raven: Raven): void {
    super.onInitialize(raven)
    const secret: string = this.config.secret || ''

    if (!secret) throw new Error('Jwt secret must be configured')

    raven.dependencyContainer
      .resolve(KoaPlugin)
      .useKoaMiddleware(MiddlewarePriority.PostIngress, KoaJwt({ secret, passthrough: !this.config.blockWithoutToken }))
      .useMiddleware(MiddlewarePriority.PostRouting, new AuthMiddleware(!!this.config.defaultAuthorized))

    raven.useService(AuthService, new AuthService(secret))
  }
}

export { AuthService, Authorize, RavenPluginAuth }
