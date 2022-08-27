import { Plugin, Raven } from 'raven'
import AuthController from './AuthController'
import AuthService from './AuthService'

export default class RavenPluginAuth extends Plugin {
  initialize(raven: Raven): void {
    console.log('Registering plugin: ', this.constructor.name)

    // Models
    //raven.useModel(UserModel)

    // Services
    raven.useService(AuthService)

    // Controllers
    raven.useController(AuthController)
  }
}
