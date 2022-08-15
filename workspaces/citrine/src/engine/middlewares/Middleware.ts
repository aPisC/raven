import { Callable } from "../../lib/Callable";
import Koa from "koa";

export abstract class Middleware extends Callable<
  Promise<any>,
  [Koa.Context, Koa.Next]
> {}
