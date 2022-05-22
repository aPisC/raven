import Koa from "koa";
import { createServer } from "http";
import { ICitrineConfiguration } from "../config/config";
import _ from "lodash";
import { defaultConfig } from "./config.default";

export class Citrine {
  public readonly config: ICitrineConfiguration;
  public readonly koa: Koa;

  constructor(config: ICitrineConfiguration) {
    this.config = _.merge(config, defaultConfig);

    this.koa = new Koa();
  }

  private loadApis() {

  }

  public async start() {
    const httpServer = createServer(this.koa.callback());
    httpServer.listen(this.config.server.port);
  }
}
