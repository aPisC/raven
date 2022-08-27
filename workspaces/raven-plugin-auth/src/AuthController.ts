import Joi from 'joi'
import { Context, injectable, Route, Validate } from 'raven'
import 'reflect-metadata'

@injectable()
export default class AuthController {
  //private readonly authService: AuthService

  constructor() {
    //this.authService = authService
  }

  @Route.Get('/login')
  @Validate.Body(() => Joi.object())
  async login(ctx: Context) {
    const pt = Reflect.getMetadata('design:paramtypes', this, 'login')
    console.log(pt)
  }
}
