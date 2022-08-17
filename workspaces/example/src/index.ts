import { Raven } from "raven";
import TestController from "./api/TestController";

const server = new Raven();

server.config.port = 3000;

server.addController(TestController);

server.start();
