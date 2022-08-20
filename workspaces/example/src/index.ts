import { Raven } from "raven";
import TestController from "./api/TestController";

const server = new Raven();

server.config.port = 3000;

server.useMiddleware((ctx, next) => {
  console.log("Endpoint: ", ctx.endpoint);
  return next();
});

server.addController(TestController);

server.start();
