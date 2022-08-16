import { Citrine } from "citrine";
import TestController from "./api/TestController";

const server = new Citrine();

server.config.port = 3000;

server.addController(TestController);

server.start();
