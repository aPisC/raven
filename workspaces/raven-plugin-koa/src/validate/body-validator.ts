import Joi from 'joi'
import { ValidatorFn } from './create-annotation'

export function bodyValidator(schema: Joi.Schema | (() => Joi.Schema)): ValidatorFn {
  return (ctx) => {
    const _schema = typeof schema === 'function' ? schema() : schema
    const body = ctx.request.body

    const { error } = _schema.validate(body)
    if (error) throw error
  }
}
