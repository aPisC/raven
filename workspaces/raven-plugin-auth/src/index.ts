import KoaJwt from 'koa-jwt'
import { MiddlewarePriority, Plugin, Raven } from 'raven'
import { AuthMiddleware } from './authMiddleware'
import { Authorize } from './authorize'
import AuthService from './authService'

const SETTINGS_ROOT = 'plugins.raven-plugin-auth'

interface RavenAuthPluginConfiguration {
  blockWithoutToken: boolean
  defaultAuthorized: boolean
}

export default class RavenPluginAuth extends Plugin {
  private config: RavenAuthPluginConfiguration = {
    blockWithoutToken: true,
    defaultAuthorized: true,
  }

  initialize(raven: Raven): void {
    const config = raven.config.getSection('plugins.raven-plugin-auth')

    const secret: string = config.getRequired('secret')

    if (!secret) throw new Error('Jwt secret must be configured')

    raven.useKoaMiddleware(
      MiddlewarePriority.PostIngress,
      KoaJwt({ secret, passthrough: !this.config.blockWithoutToken })
    )
    raven.useMiddleware(MiddlewarePriority.PostRouting, new AuthMiddleware(!!this.config.defaultAuthorized))
    raven.useService(AuthService, new AuthService(secret))
  }

  configure(config: Partial<RavenAuthPluginConfiguration>) {
    this.config = { ...this.config, ...config }
  }
}

export { AuthService, Authorize, RavenPluginAuth }
