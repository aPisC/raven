import "reflect-metadata";

import { createServer } from "http";
import Koa from "koa";
import Router from "koa-router";
import { Model, ModelCtor, Repository, Sequelize } from "sequelize-typescript";
import {
  container as globalDependencyContainer,
  FactoryProvider,
  ValueProvider,
} from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { ExecuteEndpointMiddleware } from "../middleware/executeEndpointMiddleware";
import { KoaMiddleware } from "../middleware/koaMiddleware";
import { Middleware } from "../middleware/middleware";
import { Plugin } from "../plugin/plugin";
import { Route } from "../route/route";

const ControllerSymbol: unique symbol = Symbol();
const ModelSymbol: unique symbol = Symbol();

export class Raven {
  public config: any = {};

  private readonly middlewares: symbol[] = [];

  public readonly dependencyContainer =
    globalDependencyContainer.createChildContainer();

  constructor() {
    this.dependencyContainer.registerInstance(Raven, this);
  }

  usePlugin(plugin: Plugin | constructor<Plugin> | string) {
    let pluginName: string;
    let pluginConstruct: constructor<Plugin>;
    let pluginInstance: Plugin | null = null;

    if (typeof plugin === "string") {
      pluginName = plugin;
      const pluginModule = require(plugin);
      plugin =
        typeof pluginModule === "function"
          ? pluginModule
          : pluginModule.default;
    }

    if (typeof plugin === "object") {
      pluginInstance = plugin;
      pluginConstruct = plugin.constructor as constructor<Plugin>;
      pluginName ??= pluginConstruct.name;
    } else if (typeof plugin === "function") {
      pluginConstruct = plugin;
      pluginName ??= pluginConstruct.name;
    } else {
      throw new Error("Unable to resolve plugin");
    }

    if (this.dependencyContainer.isRegistered(pluginConstruct, true))
      throw new Error("Plugin is already registered");

    if (!pluginInstance)
      pluginInstance = this.dependencyContainer.resolve(pluginConstruct);

    if (!(pluginInstance instanceof Plugin))
      throw new Error(`Unable to instantiate plugin`);

    this.dependencyContainer.registerInstance(pluginConstruct, pluginInstance);
    pluginInstance.initialize(this);
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

  addController(controller: constructor<Object>) {
    this.dependencyContainer.register(ControllerSymbol, controller);
  }

  getRepository<M extends Model>(model: ModelCtor<M>): Repository<M> {
    throw new Error("Not implemented");
  }

  start() {
    // Registering controllers
    const router = new Router();
    const controllers = this.dependencyContainer.isRegistered(ControllerSymbol)
      ? this.dependencyContainer.resolveAll<Object>(ControllerSymbol)
      : [];
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

    // Initialize Sequelize
    const models = this.dependencyContainer.isRegistered(ModelSymbol)
      ? this.dependencyContainer.resolveAll<ModelCtor>(ModelSymbol)
      : [];
    const sequelize = new Sequelize({
      repositoryMode: true,
      models: models,
    });
    sequelize.getRepository;
  }
}
