import KoaJwt from 'koa-jwt'
import { MiddlewarePriority, Plugin, Raven } from 'raven'
import { AuthMiddleware } from './authMiddleware'
import { Authorize } from './authorize'
import AuthService from './authService'

const SETTINGS_ROOT = 'plugins.raven-plugin-auth'

export default class RavenPluginAuth extends Plugin {
  initialize(raven: Raven): void {
    const config = raven.config.getSection('plugins.raven-plugin-auth')

    const secret: string = config.getRequired('secret')
    const blockWithoutToken: boolean = config.get('blockWithoutToken', false)
    const defaultAuthorized: boolean = config.get('defaultAuthorized', false)

    if (!secret) throw new Error('Jwt secret must be configured')

    raven.useKoaMiddleware(MiddlewarePriority.PostIngress, KoaJwt({ secret, passthrough: !blockWithoutToken }))
    raven.useMiddleware(MiddlewarePriority.PostRouting, new AuthMiddleware(!!defaultAuthorized))
    raven.useService(AuthService, new AuthService(secret))
  }
}

export { AuthService, Authorize, RavenPluginAuth }
