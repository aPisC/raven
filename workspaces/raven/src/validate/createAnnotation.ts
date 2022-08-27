import { Context } from 'koa'
import { Route } from '../route/route'

export type ValidatorFn = (ctx: Context) => void | Promise<void>

export const ValidationSymbol = Symbol()

export function createAnnotation(validator: (ctx: Context) => void) {
  return Route.Annotate(ValidationSymbol, (validators?: ValidatorFn[]) => {
    return Array.isArray(validators) ? [...validators, validator] : [validator]
  })
}
