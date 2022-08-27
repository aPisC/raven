import { spy, verify } from "ts-mockito";
import { Raven } from "../../../src";

describe("Raven dependency injection functions", () => {
  test("useController registers constructor", () => {
    const { server, dependencyContainerMock } = createServer();
    server.useController(Controller1);

    verify(
      dependencyContainerMock.register(Raven.ControllersSymbol, Controller1)
    ).once();
  });
});

function createServer() {
  const server = new Raven();
  const dependencyContainerMock = spy(server.dependencyContainer);
  return { server, dependencyContainerMock };
}

class Controller1 {}
