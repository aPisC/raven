import "reflect-metadata";

import { createServer } from "http";
import Koa from "koa";
import { container as globalDependencyContainer } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Route } from "../route/route";

const ControllerSymbol: unique symbol = Symbol();

export class Citrine {
  public config: any = {};

  public readonly dependencyContainer =
    globalDependencyContainer.createChildContainer();

  constructor() {}

  start() {
    // Creating koa server
    const koa = new Koa();

    //Registering middlewares
    // Todo

    // Registering controllers
    const controllers =
      this.dependencyContainer.resolveAll<Object>(ControllerSymbol);
    controllers.forEach((controller) => {
      const router = Route.CreateRouter(controller);
      koa.use(router.routes());
    });

    // Starting http server
    const httpServer = createServer(koa.callback());
    httpServer.listen(this.config.port);
    console.log("Server started", httpServer.address());
  }

  addController(controller: constructor<Object>) {
    this.dependencyContainer.register(ControllerSymbol, controller);
  }
}
