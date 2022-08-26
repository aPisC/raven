import { Context, Next } from "koa";
import { Middleware, Plugin, Raven } from "raven";
import { autoInjectable } from "tsyringe";
import TestController from "./TestController";
import { TestModel } from "./TestModel";

@autoInjectable()
class TestPlugin extends Plugin {
  initialize(raven: Raven): void {
    raven.addController(TestController);
    raven.useMiddleware(
      class TestClass extends Middleware {
        protected execute(ctx: Context, next: Next) {
          console.log("Endpoint: ", ctx.endpoint, this);
          return next();
        }
      }
    );
  }
}

const server = new Raven();
server.config.port = 3000;
server.usePlugin(TestPlugin);
server.addModel(TestModel);
//server.usePlugin("raven-plugin-auth");
server.start();
