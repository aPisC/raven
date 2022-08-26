import { Context, Next } from "koa";
import { Middleware, Plugin, Raven } from "raven";
import { autoInjectable } from "tsyringe";

@autoInjectable()
class TestPlugin extends Plugin {
  initialize(raven: Raven): void {
    raven.useMiddleware(
      class extends Middleware {
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
server.loadFiles({
  root: __dirname,
  controllers: ["*Controller.ts"],
  models: ["*Model.ts"],
});
//server.usePlugin("raven-plugin-auth");
server.start();
