import { Route, Validate } from 'raven-plugin-koa'
import RavenPluginAuth from '.'

export const AuthorizeSymbol = Symbol('Authorize')

export function Authorize(authorize: boolean = true): MethodDecorator {
  return (target: Object | Function, propertyKey: string | symbol) => {
    Validate.PluginInitialized(RavenPluginAuth)(target, propertyKey)
    Route.Annotate(AuthorizeSymbol, authorize)(target, propertyKey)
  }
}
