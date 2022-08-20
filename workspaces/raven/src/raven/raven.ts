import "reflect-metadata";

import { createServer } from "http";
import Koa, { Middleware } from "koa";
import Router from "koa-router";
import { container as globalDependencyContainer } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ExecuteEndpointMiddleware } from "../middlewares/executeEndpointMiddleware";
import { Route } from "../route/route";

const ControllerSymbol: unique symbol = Symbol();

export class Raven {
  public config: any = {};

  private readonly middlewares: Middleware[] = [];

  public readonly dependencyContainer =
    globalDependencyContainer.createChildContainer();

  constructor() {}

  useMiddleware(middleware: Middleware) {
    this.middlewares.push(middleware);
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
    this.middlewares.forEach((middleware) => koa.use(middleware));
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
