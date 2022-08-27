import { Route } from 'raven'

export const AuthorizeSymbol = Symbol('Authorize')

export function Authorize(authorize: boolean = true) {
  return Route.Annotate(AuthorizeSymbol, authorize)
}
