import 'reflect-metadata'

import { createServer } from 'http'
import Koa from 'koa'
import KoaBodyparser from 'koa-bodyparser'
import Router from 'koa-router'
import { Model, ModelCtor, Repository, Sequelize, SequelizeOptions } from 'sequelize-typescript'
import { container as globalDependencyContainer, FactoryProvider } from 'tsyringe'
import { constructor } from 'tsyringe/dist/typings/types'
import { ExecuteEndpointMiddleware } from '../middleware/execute-endpoint-middleware'
import { KoaMiddleware } from '../middleware/koa-middleware'
import { Middleware } from '../middleware/middleware'
import { MiddlewarePriority } from '../middleware/middleware-priority'
import { Plugin } from '../plugin/plugin'
import { Route } from '../route'
import { ValidateMiddleware } from '../validate/validate-middleware'
import { RavenLoader, RavenLoaderConfig } from './loader'

export class Raven {
  // Dependency injection symbols
  public static readonly KoaCtorSymbol = Symbol()
  public static readonly SequelizeCtorSymbol = Symbol()
  public static readonly ControllersSymbol: unique symbol = Symbol()
  public static readonly ModelsSymbol: unique symbol = Symbol()

  public config: any = {}

  private readonly middlewares: { symbol: symbol; priority: MiddlewarePriority }[] = []

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

  useService<T extends Object>(ctor: constructor<T>, service?: T | (() => T)) {
    if (!service) this.dependencyContainer.register(ctor, ctor)
    else if (typeof service === 'function') this.dependencyContainer.register(ctor, { useFactory: service as () => T })
    else if (typeof service === 'object') this.dependencyContainer.registerInstance(ctor, service)
    else throw new Error('Unable to register service')
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

  useKoaMiddleware(priority: MiddlewarePriority, middleware: KoaMiddleware) {
    const middlewareSymbol = Symbol()

    this.dependencyContainer.register(middlewareSymbol, {
      useValue: middleware,
    })
    this.middlewares.push({ symbol: middlewareSymbol, priority: priority })
  }

  useMiddleware(priority: MiddlewarePriority, middleware: constructor<Middleware>): void
  useMiddleware(priority: MiddlewarePriority, middleware: Middleware): void
  useMiddleware(priority: MiddlewarePriority, middleware: FactoryProvider<Middleware>): void
  useMiddleware(priority: MiddlewarePriority, middleware: any) {
    const middlewareSymbol = Symbol()

    if (middleware instanceof Middleware) this.dependencyContainer.registerInstance(middlewareSymbol, middleware)
    else this.dependencyContainer.register(middlewareSymbol, middleware)
    this.middlewares.push({ symbol: middlewareSymbol, priority: priority })
  }

  getRepository<M extends Model>(model: ModelCtor<M>): Repository<M> {
    try {
      return this.sequelize.getRepository(model)
    } catch (err: any) {
      throw new Error(`Unable to create repository for ${model.name}. ${err}`)
    }
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
    const resolvedMiddlewares = this.middlewares.map(({ priority, symbol }) => {
      const middleware = this.dependencyContainer.resolve<Middleware | KoaMiddleware>(symbol)
      const handler = typeof middleware === 'function' ? middleware : middleware.handler
      return { priority, handler }
    })

    resolvedMiddlewares
      .filter(({ priority }) => priority === MiddlewarePriority.PreIngress)
      .forEach(({ handler }) => koa.use(handler))
    resolvedMiddlewares
      .filter(({ priority }) => priority === MiddlewarePriority.PostIngress)
      .forEach(({ handler }) => koa.use(handler))
    resolvedMiddlewares
      .filter(({ priority }) => priority === MiddlewarePriority.PreRouting)
      .forEach(({ handler }) => koa.use(handler))
    koa.use(router.routes())
    resolvedMiddlewares
      .filter(({ priority }) => priority === MiddlewarePriority.PostRouting)
      .forEach(({ handler }) => koa.use(handler))
    koa.use(KoaBodyparser({}))
    resolvedMiddlewares
      .filter(({ priority }) => priority === MiddlewarePriority.PreExecute)
      .forEach(({ handler }) => koa.use(handler))
    koa.use(ValidateMiddleware(this))
    koa.use(ExecuteEndpointMiddleware)

    // Starting http server
    const httpServer = createServer(koa.callback())
    httpServer.listen(this.config.port)
    console.log('Server started', httpServer.address())
  }
}
