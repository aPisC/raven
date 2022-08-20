import { Route } from "raven";

@Route.Prefix("/test")
@Route.Annotate("key", "value")
export default class TestController {
  @Route.Get("/")
  @Route.Annotate("key2", "value")
  async index() {
    console.log("first");
    return "HelloWorld";
  }
}
