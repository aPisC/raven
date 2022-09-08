import { Context, Next } from "koa";

export type KoaMiddleware = (ctx: Context, next: Next) => any;
