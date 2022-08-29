import Joi from 'joi'
import { bodyValidator } from './body-validator'
import { createAnnotation, ValidationSymbol } from './create-annotation'
import { pluginInitializedValidator } from './plugin-initialized-validator'

export const Validate = {
  Symbol: ValidationSymbol,
  Validate: createAnnotation,
  Body: (schema: Joi.Schema | (() => Joi.Schema)) => createAnnotation(bodyValidator(schema)),
  PluginInitialized: pluginInitializedValidator,
}
