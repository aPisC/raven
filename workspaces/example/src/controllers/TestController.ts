import { Context, Raven } from 'raven'
import { Route } from 'raven-plugin-koa'
import { Authorize, AuthService } from 'raven-plugin-koa-auth'
import 'reflect-metadata'
import { Repository, Sequelize } from 'sequelize-typescript'
import { injectable } from 'tsyringe'
import TestModel from '../models/TestModel'

@Route.Prefix('/test')
@injectable()
export default class TestController {
  private model: Repository<TestModel>

  constructor(sequelize: Sequelize, private authService: AuthService, private raven: Raven) {
    this.model = sequelize.getRepository(TestModel)
  }

  @Route.Get('/')
  @Authorize()
  async index() {
    const service = this.raven.dependencyContainer.resolve(AuthService)
    console.log('first')
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
  async login(ctx: Context) {
    return this.authService.createJwt({ userId: 10, name: 'test' })
  }
}
