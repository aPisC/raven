import { Route } from "citrine";

@Route.Prefix("/test")
export default class TestController {
  @Route.Get("/")
  async index() {
    console.log("first");
    return "HelloWorld";
  }
}
