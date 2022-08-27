import { Route } from 'raven'
import { Authorize } from 'raven-plugin-auth'
import { Repository, Sequelize } from 'sequelize-typescript'
import { injectable } from 'tsyringe'
import TestModel from '../models/TestModel'

@Route.Prefix('/test')
@Route.Annotate('key', 'value')
@injectable()
export default class TestController {
  private model: Repository<TestModel>

  constructor(sequelize: Sequelize) {
    this.model = sequelize.getRepository(TestModel)
  }

  @Route.Get('/')
  @Authorize()
  async index() {
    console.log('first')
    return 'HelloWorld'
  }

  @Route.Get('/model')
  async useModel(): Promise<TestModel | null> {
    const entry = await this.model.findOne()
    console.log(entry)
    return entry
  }
}
