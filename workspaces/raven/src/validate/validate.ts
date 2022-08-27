import Joi from 'joi'
import { bodyValidator } from './bodyValidator'
import { createAnnotation, ValidationSymbol } from './createAnnotation'
import { pluginInitializedValidator } from './pluginInitializedValidator'

export const Validate = {
  Symbol: ValidationSymbol,
  Validate: createAnnotation,
  Body: (schema: Joi.Schema | (() => Joi.Schema)) => createAnnotation(bodyValidator(schema)),
  PluginInitialized: pluginInitializedValidator,
}
