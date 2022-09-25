import { Context, Next } from 'koa'

export abstract class Middleware {
  protected abstract execute(ctx: Context, next: Next): any

  public get handler() {
    return this.execute.bind(this)
  }
}
