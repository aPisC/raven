import { Plugin, Raven } from 'raven'
import { ModelCtor, Sequelize } from 'sequelize-typescript'
import { injectable } from 'tsyringe'
import { FileLoader } from './FileLoader'

@injectable()
export class RavenSequelizePlugin extends Plugin {
  public readonly loader = new FileLoader(this)

  private SequelizeCtor: typeof Sequelize = Sequelize
  private models: ModelCtor[] = []

  constructor(raven: Raven) {
    super(raven)
  }

  useModel(model: ModelCtor): this {
    this.models.push(model)
    return this
  }

  extend(extender: (sequelizeClass: typeof Sequelize) => typeof Sequelize) {
    this.SequelizeCtor = extender(this.SequelizeCtor)
  }

  override onRegister(): void {
    super.onRegister()

    // Register model loader
    this.raven.loader.addLoader('models', (file) => this.loader.load(file))

    // Register sequelize instance factory
    this.raven.dependencyContainer.register(Sequelize, {
      useFactory: (dependencyContainer) => {
        const sequelize = this.initializeSequelizeInstance()
        dependencyContainer.registerInstance(Sequelize, sequelize)
        return sequelize
      },
    })
  }

  override async onStart() {
    await super.onStart()

    const sequelize = this.raven.dependencyContainer.resolve(Sequelize)
    await sequelize.sync()
  }

  private initializeSequelizeInstance() {
    const sequelize = new this.SequelizeCtor({
      ...this.config.getObject(),
      repositoryMode: true,
      models: this.models,
    })

    return sequelize
  }
}
