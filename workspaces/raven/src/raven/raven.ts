import "reflect-metadata";

import { createServer } from "http";
import Koa from "koa";
import Router from "koa-router";
import {
  container as globalDependencyContainer,
  FactoryProvider,
  ValueProvider,
} from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ExecuteEndpointMiddleware } from "../middleware/executeEndpointMiddleware";
import { KoaMiddleware } from "../middleware/koaMiddleware";
import { Middleware } from "../middleware/middleware";
import { Route } from "../route/route";

const ControllerSymbol: unique symbol = Symbol();

export class Raven {
  public config: any = {};

  private readonly middlewares: symbol[] = [];

  public readonly dependencyContainer =
    globalDependencyContainer.createChildContainer();

  constructor() {
    this.dependencyContainer.registerInstance(Raven, this);
  }

  useKoaMiddleware(middleware: KoaMiddleware) {
    const middlewareSymbol = Symbol();

    this.dependencyContainer.register(middlewareSymbol, {
      useValue: middleware,
    });
    this.middlewares.push(middlewareSymbol);
  }

  useMiddleware(middleware: constructor<Middleware>): void;
  useMiddleware(middleware: ValueProvider<Middleware>): void;
  useMiddleware(middleware: FactoryProvider<Middleware>): void;
  useMiddleware(middleware: any) {
    const middlewareSymbol = Symbol();

    this.dependencyContainer.register(middlewareSymbol, middleware);
    this.middlewares.push(middlewareSymbol);
  }

  start() {
    // Registering controllers
    const router = new Router();
    const controllers =
      this.dependencyContainer.resolveAll<Object>(ControllerSymbol);
    controllers.forEach((controller) => {
      const controllerRouter = Route.CreateRouter(controller);
      router.use(controllerRouter.routes());
    });

    // Creating koa server
    const koa = new Koa();

    // Register middlewares
    koa.use(router.routes());
    this.middlewares.forEach((middlewareSymbol) => {
      const middleware = this.dependencyContainer.resolve<
        Middleware | KoaMiddleware
      >(middlewareSymbol);
      const handler =
        typeof middleware === "function" ? middleware : middleware.handler;
      koa.use(handler);
    });
    koa.use(ExecuteEndpointMiddleware);

    // Starting http server
    const httpServer = createServer(koa.callback());
    httpServer.listen(this.config.port);
    console.log("Server started", httpServer.address());
  }

  addController(controller: constructor<Object>) {
    this.dependencyContainer.register(ControllerSymbol, controller);
  }
}
