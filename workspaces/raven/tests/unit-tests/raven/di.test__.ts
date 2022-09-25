import { Context, Next } from 'koa'
import { Model } from 'sequelize-typescript'
import { anything, spy, verify } from 'ts-mockito'
import { Middleware, Raven } from '../../../src'

describe('Raven dependency injection functions', () => {
  test('UseController registers type', () => {
    const { server, dependencyContainerMock } = createServer()
    server.useController(EmptyController)

    verify(dependencyContainerMock.register(Raven.ControllersSymbol, EmptyController)).once()
  })

  test('UseModel registers Model constructor', () => {
    const { server, dependencyContainerMock } = createServer()
    server.useModel(EmptyModel)

    verify(dependencyContainerMock.registerInstance(Raven.ModelsSymbol, EmptyModel)).once()
  })

  test('UseMiddleware registers class', () => {
    const { server, dependencyContainerMock } = createServer()
    server.useMiddleware(EmptyMiddleware)

    verify(dependencyContainerMock.register(anything(), EmptyMiddleware)).once()
  })

  test('UseMiddleware registers instance', () => {
    const { server, dependencyContainerMock } = createServer()
    const provider = { useValue: new EmptyMiddleware() }
    server.useMiddleware(provider)

    verify(dependencyContainerMock.register(anything(), provider)).once()
  })

  test('UseMiddleware registers factory', () => {
    const { server, dependencyContainerMock } = createServer()
    const provider = { useFactory: () => new EmptyMiddleware() }
    server.useMiddleware(provider)

    verify(dependencyContainerMock.register(anything(), provider)).once()
  })

  test('UseKoaMiddleware registers function', () => {
    const { server, dependencyContainerMock } = createServer()
    server.useKoaMiddleware(() => {})

    verify(dependencyContainerMock.register(anything(), anything())).once()
  })
})

function createServer() {
  const server = new Raven()
  const dependencyContainerMock = spy(server.dependencyContainer)
  return { server, dependencyContainerMock }
}

class EmptyController {}
class EmptyModel extends Model {}
class EmptyMiddleware extends Middleware {
  protected execute(ctx: Context, next: Next) {
    throw new Error('Method not implemented.')
  }
}
