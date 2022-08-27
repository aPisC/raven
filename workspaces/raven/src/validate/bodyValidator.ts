import Joi from 'joi'
import { ValidatorFn } from './createAnnotation'

export function bodyValidator(schema: Joi.Schema | (() => Joi.Schema)): ValidatorFn {
  return (ctx) => {
    const _schema = typeof schema === 'function' ? schema() : schema
    const body = ctx.body

    const { error, value } = _schema.validate(body)
    if (error) throw error
  }
}
