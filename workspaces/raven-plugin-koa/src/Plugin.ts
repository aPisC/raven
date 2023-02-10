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
import { FileLoader } from './FileLoader'

@injectable()
export class RavenKoaPlugin extends Plugin {
  private readonly loader = new FileLoader(this)
  private readonly container: DependencyContainer

  private controllers: symbol[] = []
  private readonly middlewares: { symbol: symbol; priority: MiddlewarePriority }[] = []

  private KoaCtor: typeof Koa<any, any> = Koa
  private initialized: boolean = false

  constructor(raven: Raven) {
    super(raven)
    this.container = raven.dependencyContainer
  }

  useKoaMiddleware(priority: MiddlewarePriority, middleware: KoaMiddleware) {
    this.assertUninitialized()
    const middlewareSymbol = Symbol()

    this.container.register(middlewareSymbol, {
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

    if (middleware instanceof Middleware) this.container.registerInstance(middlewareSymbol, middleware)
    else this.container.register(middlewareSymbol, middleware)
    this.middlewares.push({ symbol: middlewareSymbol, priority: priority })

    return this
  }

  useController(controller: constructor<Object>) {
    this.assertUninitialized()

    const controllerSymbol = Symbol()
    this.container.register(controllerSymbol, controller)
    this.controllers.push(controllerSymbol)

    return this
  }

  extend(extender: (koaClass: typeof Koa) => typeof Koa) {
    this.KoaCtor = extender(this.KoaCtor)
    return this
  }

  //#endregion
  //#region Plugin registration hooks

  override onRegister(): void {
    super.onRegister()

    this.raven.loader.addLoader('controllers', (filename) => this.loader.load(filename))

    this.container.register(Koa, {
      useFactory: (dependencyContainer) => {
        const koa = this.initializeKoaInstance()
        dependencyContainer.registerInstance(Koa, koa)
        this.initialized = true
        return koa
      },
    })
  }

  override async onStart(): Promise<void> {
    // Resolve koa instance
    this.container.resolve(Koa)
  }

  override onListen() {
    // Start http server for koa
    const koa = this.container.resolve(Koa)
    const httpServer = createServer(koa.callback())
    httpServer.listen(this.config.getRequired('port'))
    console.log('Server started', httpServer.address())
  }

  private initializeKoaInstance() {
    const router = new Router()
    const resolvedControllers = this.controllers.map((sym) => this.container.resolve<Object>(sym))
    resolvedControllers.forEach((controller) => {
      const controllerRouter = Route.CreateRouter(controller)
      router.use(controllerRouter.routes())
    })

    // Creating koa server
    const koa = new this.KoaCtor()

    // Register middlewares
    const resolvedMiddlewares = this.middlewares.map(({ priority, symbol }) => {
      const middleware = this.container.resolve<Middleware | KoaMiddleware>(symbol)
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
