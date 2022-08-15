import Koa from "koa";
import { createServer } from "http";
import { ICitrineConfiguration } from "../config/config";
import _, { forEach } from "lodash";
import { PluginManager } from "./plugins/PluginManager";

export class Citrine {
  private readonly pluginManager : PluginManager = new PluginManager();
  private _koa: Koa;

  public get koa() {return this._koa}

  constructor(config: ICitrineConfiguration) {
    this._koa = new Koa();
  }


  public async start() {
    // Initialize registered plugins
    this.pluginManager.lock()
    for (const plugin of this.pluginManager.plugins) {
      await plugin.initialize(this);
    }

    const httpServer = createServer(this.koa.callback());
    httpServer.listen(3000);
  }
}
