import { Callable } from "../../lib/Callable";
import Koa from "koa";
import { Middleware } from "./Middleware";

export interface IMiddlewareProvider {
  (ctx: Koa.Context, next: Koa.Next): Promise<any>;
}

export class MiddlewareProvider
  extends Callable<Promise<any>, [Koa.Context, Koa.Next]>
  implements IMiddlewareProvider
{
  protected middlewares: Middleware[] = [];

  registerMiddleware(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  async __call__(ctx: Koa.Context, next: Koa.Next): Promise<any> {
    const executeMiddleware = async (i: number) => {
      if (i >= this.middlewares.length) return await next();

      return await this.middlewares[i](ctx, () => executeMiddleware(i + 1));
    };
    return await executeMiddleware(0);
  }
}
