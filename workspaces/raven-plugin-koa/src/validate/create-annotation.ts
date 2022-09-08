import { Context } from 'koa'
import { Raven } from 'raven'
import { Route } from '../route'

export type ValidatorFn = (ctx: Context, raven: Raven) => void | Promise<void>

export const ValidationSymbol = Symbol()

export function createAnnotation(validator: ValidatorFn): (target: Object, propertyKey: string | symbol) => void {
  return Route.Annotate(ValidationSymbol, (validators?: ValidatorFn[]) => {
    return Array.isArray(validators) ? [...validators, validator] : [validator]
  })
}
