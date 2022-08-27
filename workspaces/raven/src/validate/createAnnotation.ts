import { Context } from 'koa'
import { Raven } from '../raven/raven'
import { Route } from '../route/route'

export type ValidatorFn = (ctx: Context, raven: Raven) => void | Promise<void>

export const ValidationSymbol = Symbol()

export function createAnnotation(validator: ValidatorFn) {
  return Route.Annotate(ValidationSymbol, (validators?: ValidatorFn[]) => {
    return Array.isArray(validators) ? [...validators, validator] : [validator]
  })
}
