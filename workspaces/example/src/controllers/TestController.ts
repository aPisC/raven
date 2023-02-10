import { Route } from 'raven-plugin-koa'
import { Authorize, AuthService, RequireScope } from 'raven-plugin-koa-auth'
import { Repository, Sequelize } from 'sequelize-typescript'
import { injectable } from 'tsyringe'
import TestModel from '../models/TestModel'
import { Context } from 'koa'

@Route.Prefix('/test')
@injectable()
export default class TestController {
  private model: Repository<TestModel>

  constructor(sequelize: Sequelize, private authService: AuthService) {
    this.model = sequelize.getRepository(TestModel)
  }

  @Route.Get('/')
  @Authorize()
  @RequireScope('test-scope')
  async index(ctx: Context) {
    console.log('first', ctx.state)
    return 'HelloWorld'
  }

  @Route.Get('/model')
  async useModel(): Promise<TestModel | null> {
    const entry = await this.model.findOne()
    console.log(entry)
    return entry
  }

  @Route.Get('/login')
  @Authorize(false)
  async login() {
    return this.authService.createJwt({ userId: 10, name: 'test', scopes: ['test-scope'] })
  }
}
