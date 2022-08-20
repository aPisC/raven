import { Context, Next } from "koa";
import { Plugin, Raven } from "raven";
import { Middleware } from "raven/dist/middleware/middleware";
import TestController from "./api/TestController";

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
server.start();
