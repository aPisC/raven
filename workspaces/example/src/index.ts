import { Context, Next } from "koa";
import { Raven } from "raven";
import { Middleware } from "raven/dist/middleware/middleware";
import TestController from "./api/TestController";

const server = new Raven();

server.config.port = 3000;

server.useMiddleware(
  class TestClass extends Middleware {
    protected execute(ctx: Context, next: Next) {
      console.log("Endpoint: ", ctx.endpoint);
      return next();
    }
  }
);

server.addController(TestController);

server.start();
