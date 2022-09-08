import { Model, ModelCtor, Sequelize } from 'sequelize-typescript'
import { DependencyContainer, injectable } from 'tsyringe'
import { Plugin } from '../plugin/plugin'
import { Raven } from '../raven/raven'

@injectable()
export class SequelizePlugin extends Plugin {
  private static readonly ModelsSymbol = Symbol('Sequelize Models')

  private readonly raven: Raven

  private Sequelize: typeof Sequelize = Sequelize

  constructor(raven: Raven) {
    super()
    this.raven = raven
  }

  useModel(model: typeof Model) {
    this.raven.dependencyContainer.registerInstance(SequelizePlugin.ModelsSymbol, model)
  }

  extend(extender: (sequelizeClass: typeof Sequelize) => typeof Sequelize) {
    this.Sequelize = extender(this.Sequelize)
  }

  override onRegister(raven: Raven): void {
    super.onRegister(raven)

    // Register model loader
    raven.loader.useLoader('models', (mod, file, error) => {
      console.log(`Loading model from ${file}...`)
      if (typeof mod === 'object' && typeof mod.default === 'function') this.useModel(mod.default)
      else if (typeof mod === 'function') this.useModel(mod)
      else console.log(`Unable to register model from file ${file}. Error: ${error}`)
    })

    // Register sequelize instance factory
    raven.dependencyContainer.register(Sequelize, {
      useFactory: (dependencyContainer) => {
        const sequelize = this.initializeSequelizeInstance(dependencyContainer)
        dependencyContainer.registerInstance(Sequelize, sequelize)
        return sequelize
      },
    })
  }

  override async onStart(raven: Raven) {
    await super.onStart(raven)

    const sequelize = raven.dependencyContainer.resolve(Sequelize)
    await sequelize.sync()
  }

  private initializeSequelizeInstance(dependencyContainer: DependencyContainer) {
    const models = dependencyContainer.isRegistered(SequelizePlugin.ModelsSymbol)
      ? dependencyContainer.resolveAll<ModelCtor>(SequelizePlugin.ModelsSymbol)
      : []

    const sequelize = new this.Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      repositoryMode: true,
      models: models,
    })

    return sequelize
  }
}
