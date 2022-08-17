import "reflect-metadata";

import { createServer } from "http";
import Koa, { Context, Next } from "koa";
import Router from "koa-router";
import { container as globalDependencyContainer } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ExecuteEndpointMiddleware } from "../middlewares/executeEndpointMiddleware";
import { Route } from "../route/route";

const ControllerSymbol: unique symbol = Symbol();

export class Raven {
  public config: any = {};

  public readonly dependencyContainer =
    globalDependencyContainer.createChildContainer();

  constructor() {}

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
    koa.use(router.routes());
    koa.use((ctx: Context, next: Next) => {
      console.log("endpoint", ctx.endpoint);
      return next();
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
