import { createServer } from 'http'
import Koa from 'koa'
import KoaBodyparser from 'koa-bodyparser'
import Router from 'koa-router'
import { FactoryProvider, injectable } from 'tsyringe'
import { constructor, DependencyContainer } from 'tsyringe/dist/typings/types'
import { ExecuteEndpointMiddleware } from './middleware/execute-endpoint-middleware'
import { KoaMiddleware } from './middleware/koa-middleware'
import { Middleware } from './middleware/middleware'
import { MiddlewarePriority } from './middleware/middleware-priority'

import { Plugin, Raven } from 'raven'
import { Route } from './route'
import { ValidateMiddleware } from './validate/validate-middleware'

interface KoaPluginConfig {
  port: number
}

const ControllersSymbol = Symbol('Controllers')

@injectable()
export class RavenPluginKoa extends Plugin<KoaPluginConfig> {
  private readonly middlewares: { symbol: symbol; priority: MiddlewarePriority }[] = []
  private readonly raven: Raven

  private Koa: typeof Koa<any, any> = Koa
  private initialized: boolean = false

  constructor(raven: Raven) {
    super()
    this.raven = raven
  }

  //#region Resource registration

  useKoaMiddleware(priority: MiddlewarePriority, middleware: KoaMiddleware) {
    this.assertUninitialized()
    const middlewareSymbol = Symbol()

    this.raven.dependencyContainer.register(middlewareSymbol, {
      useValue: middleware,
    })
    this.middlewares.push({ symbol: middlewareSymbol, priority: priority })

    return this
  }

  useMiddleware(priority: MiddlewarePriority, middleware: constructor<Middleware>): void
  useMiddleware(priority: MiddlewarePriority, middleware: Middleware): void
  useMiddleware(priority: MiddlewarePriority, middleware: FactoryProvider<Middleware>): void
  useMiddleware(priority: MiddlewarePriority, middleware: any) {
    this.assertUninitialized()
    const middlewareSymbol = Symbol()

    if (middleware instanceof Middleware) this.raven.dependencyContainer.registerInstance(middlewareSymbol, middleware)
    else this.raven.dependencyContainer.register(middlewareSymbol, middleware)
    this.middlewares.push({ symbol: middlewareSymbol, priority: priority })

    return this
  }

  useController(controller: constructor<Object>) {
    this.assertUninitialized()
    this.raven.dependencyContainer.register(ControllersSymbol, controller)

    return this
  }

  extend(extender: (koaClass: typeof Koa) => typeof Koa) {
    this.Koa = extender(this.Koa)
  }

  //#endregion
  //#region Plugin registration hooks

  override onRegister(raven: Raven): void {
    super.onRegister(raven)

    raven.loader.useLoader('controllers', (mod, file, error) => {
      console.log(`Loading controller from ${file}...`)
      if (typeof mod === 'object' && typeof mod.default === 'function') this.useController(mod.default)
      else if (typeof mod === 'function') this.useController(mod)
      else console.log(`Unable to register controller from file ${file}. Error: ${error}`)
    })

    this.raven.dependencyContainer.register(Koa, {
      useFactory: (dependencyContainer) => {
        const koa = this.initializeKoaInstance(dependencyContainer)
        dependencyContainer.registerInstance(Koa, koa)
        this.initialized = true
        return koa
      },
    })
  }

  override async onStart(raven: Raven): Promise<void> {
    // Resolve koa instance
    raven.dependencyContainer.resolve(Koa)
  }

  override onListen(raven: Raven) {
    // Start http server for koa
    const koa = raven.dependencyContainer.resolve(Koa)
    const httpServer = createServer(koa.callback())
    httpServer.listen(this.config.port || 3000)
    console.log('Server started', httpServer.address())
  }

  private initializeKoaInstance(dependencyContainer: DependencyContainer) {
    const router = new Router()
    const controllers = dependencyContainer.isRegistered(ControllersSymbol)
      ? dependencyContainer.resolveAll<Object>(ControllersSymbol)
      : []
    controllers.forEach((controller) => {
      const controllerRouter = Route.CreateRouter(controller)
      router.use(controllerRouter.routes())
    })

    // Creating koa server
    const KoaCtor = this.Koa
    const koa = new KoaCtor()

    // Register middlewares
    const resolvedMiddlewares = this.middlewares.map(({ priority, symbol }) => {
      const middleware = dependencyContainer.resolve<Middleware | KoaMiddleware>(symbol)
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
    koa.use(ValidateMiddleware(this.raven))
    koa.use(ExecuteEndpointMiddleware)

    return koa
  }

  //#endregion

  private assertUninitialized() {
    if (this.initialized) throw new Error('Koa is initialized, it can not be modified')
  }
}
