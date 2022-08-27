import 'reflect-metadata'

import { createServer } from 'http'
import Koa from 'koa'
import Router from 'koa-router'
import { Model, ModelCtor, Repository, Sequelize, SequelizeOptions } from 'sequelize-typescript'
import { container as globalDependencyContainer, FactoryProvider, ValueProvider } from 'tsyringe'
import { constructor } from 'tsyringe/dist/typings/types'
import { ExecuteEndpointMiddleware } from '../middleware/executeEndpointMiddleware'
import { KoaMiddleware } from '../middleware/koaMiddleware'
import { Middleware } from '../middleware/middleware'
import { Plugin } from '../plugin/plugin'
import { Route } from '../route/route'
import { ValidateMiddleware } from '../validate/middleware'
import { RavenLoader, RavenLoaderConfig } from './loader'

export class Raven {
  // Dependency injection symbols
  public static readonly KoaCtorSymbol = Symbol()
  public static readonly SequelizeCtorSymbol = Symbol()
  public static readonly ControllersSymbol: unique symbol = Symbol()
  public static readonly ModelsSymbol: unique symbol = Symbol()

  public config: any = {}

  private readonly middlewares: symbol[] = []

  public readonly dependencyContainer = globalDependencyContainer.createChildContainer()

  constructor() {
    // Register dependency constructors
    this.dependencyContainer.registerInstance(Raven.KoaCtorSymbol, Koa)
    this.dependencyContainer.registerInstance(Raven.SequelizeCtorSymbol, Sequelize)

    // Register dependency instances
    this.dependencyContainer.registerInstance(Raven, this)
    this.dependencyContainer.register(Koa<any, any>, {
      useFactory: () => this.koa,
    })
    this.dependencyContainer.register(Sequelize, {
      useFactory: () => this.sequelize,
    })
  }

  /**
   * Properties
   */

  private _sequelize?: Sequelize
  public get sequelize() {
    if (!this._sequelize) throw new Error('Sequelize is not initialized')
    return this._sequelize
  }

  private _koa?: Koa<any, any>
  public get koa() {
    if (!this._koa) throw new Error('Koa is not initialized')
    return this._koa
  }

  /**
   * Dependency registration
   */

  useController(controller: constructor<Object>) {
    this.dependencyContainer.register(Raven.ControllersSymbol, controller)
  }

  useModel(model: typeof Model) {
    this.dependencyContainer.registerInstance(Raven.ModelsSymbol, model)
  }

  useService(service: constructor<any>): void
  useService(service: constructor<any>) {
    console.log('register service', service)
    this.dependencyContainer.register(service, service)
  }

  usePlugin(plugin: Plugin | constructor<Plugin> | string) {
    let pluginName: string
    let pluginConstruct: constructor<Plugin>
    let pluginInstance: Plugin | null = null

    if (typeof plugin === 'string') {
      pluginName = plugin
      const pluginModule = require(plugin)
      plugin = typeof pluginModule === 'function' ? pluginModule : pluginModule.default
    }

    if (typeof plugin === 'object') {
      pluginInstance = plugin
      pluginConstruct = plugin.constructor as constructor<Plugin>
      pluginName ??= pluginConstruct.name
    } else if (typeof plugin === 'function') {
      pluginConstruct = plugin
      pluginName ??= pluginConstruct.name
    } else {
      throw new Error('Unable to resolve plugin')
    }

    if (this.dependencyContainer.isRegistered(pluginConstruct, true)) throw new Error('Plugin is already registered')

    if (!pluginInstance) pluginInstance = this.dependencyContainer.resolve(pluginConstruct)

    if (!(pluginInstance instanceof Plugin)) throw new Error(`Unable to instantiate plugin`)

    this.dependencyContainer.registerInstance(pluginConstruct, pluginInstance)
    pluginInstance.initialize(this)
  }

  useKoaMiddleware(middleware: KoaMiddleware) {
    const middlewareSymbol = Symbol()

    this.dependencyContainer.register(middlewareSymbol, {
      useValue: middleware,
    })
    this.middlewares.push(middlewareSymbol)
  }

  useMiddleware(middleware: constructor<Middleware>): void
  useMiddleware(middleware: ValueProvider<Middleware>): void
  useMiddleware(middleware: FactoryProvider<Middleware>): void
  useMiddleware(middleware: any) {
    const middlewareSymbol = Symbol()

    this.dependencyContainer.register(middlewareSymbol, middleware)
    this.middlewares.push(middlewareSymbol)
  }

  getRepository<M extends Model>(model: ModelCtor<M>): Repository<M> {
    return this.sequelize.getRepository(model)
  }

  loadFiles(config: RavenLoaderConfig) {
    const loader = new RavenLoader()
    loader.load(this, config)
  }

  async start() {
    // Initialize Sequelize
    const models = this.dependencyContainer.isRegistered(Raven.ModelsSymbol)
      ? this.dependencyContainer.resolveAll<ModelCtor>(Raven.ModelsSymbol)
      : []
    const SequelizeCtor = this.dependencyContainer.resolve<new (options?: SequelizeOptions) => Sequelize>(
      Raven.SequelizeCtorSymbol
    )
    const sequelize = new SequelizeCtor({
      dialect: 'sqlite',
      storage: ':memory:',
      repositoryMode: true,
      models: models,
    })
    await sequelize.sync()
    this._sequelize = sequelize

    // Registering controllers
    const router = new Router()
    const controllers = this.dependencyContainer.isRegistered(Raven.ControllersSymbol)
      ? this.dependencyContainer.resolveAll<Object>(Raven.ControllersSymbol)
      : []
    controllers.forEach((controller) => {
      const controllerRouter = Route.CreateRouter(controller)
      router.use(controllerRouter.routes())
    })

    // Creating koa server
    const KoaCtor = this.dependencyContainer.resolve<new () => Koa<any, any>>(Raven.KoaCtorSymbol)
    const koa = new KoaCtor()
    this._koa = koa

    // Register middlewares
    koa.use(router.routes())
    this.middlewares.forEach((middlewareSymbol) => {
      const middleware = this.dependencyContainer.resolve<Middleware | KoaMiddleware>(middlewareSymbol)
      const handler = typeof middleware === 'function' ? middleware : middleware.handler
      koa.use(handler)
    })
    // Register system middlewares
    koa.use(ValidateMiddleware)
    koa.use(ExecuteEndpointMiddleware)

    // Starting http server
    const httpServer = createServer(koa.callback())
    httpServer.listen(this.config.port)
    console.log('Server started', httpServer.address())
  }
}
