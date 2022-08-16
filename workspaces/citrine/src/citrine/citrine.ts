import "reflect-metadata";

import { createServer } from "http";
import Koa from "koa";
import { container as globalDependencyContainer } from "tsyringe";

export class Citrine {
  public config: any = {};

  protected koa = new Koa();

  protected dependencyContainer =
    globalDependencyContainer.createChildContainer();

  constructor() {}

  start() {
    const httpServer = createServer(this.koa.callback());
    httpServer.listen(this.config.port);
    console.log("Server started", httpServer.address());
  }
}
