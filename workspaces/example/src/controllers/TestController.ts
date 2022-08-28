import { Context, Raven, Route } from 'raven'
import { Authorize, AuthService } from 'raven-plugin-auth'
import { Repository, Sequelize } from 'sequelize-typescript'
import { injectable } from 'tsyringe'
import TestModel from '../models/TestModel'

@Route.Prefix('/test')
@Route.Annotate('key', 'value')
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
