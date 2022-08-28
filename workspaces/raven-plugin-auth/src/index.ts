import KoaJwt from 'koa-jwt'
import _ from 'lodash'
import { MiddlewarePriority, Plugin, Raven } from 'raven'
import { AuthMiddleware } from './authMiddleware'
import { Authorize } from './authorize'
import AuthService from './authService'

const SETTINGS_ROOT = 'plugins.raven-plugin-auth'

export default class RavenPluginAuth extends Plugin {
  initialize(raven: Raven): void {
    const config = _.get(raven.config, 'plugins.raven-plugin-auth')

    const secret: string = _.get(config, 'secret')
    const blockWithoutToken: boolean = _.get(config, 'blockWithoutToken')
    const defaultAuthorized: boolean = _.get(config, 'defaultAuthorized')

    if (!secret) throw new Error('Jwt secret must be configured')

    raven.useKoaMiddleware(MiddlewarePriority.PostIngress, KoaJwt({ secret, passthrough: !blockWithoutToken }))
    raven.useMiddleware(MiddlewarePriority.PostRouting, new AuthMiddleware(!!defaultAuthorized))
    raven.useService(AuthService, new AuthService(secret))
  }
}

export { AuthService, Authorize, RavenPluginAuth }
