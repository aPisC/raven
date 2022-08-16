import { Route } from "citrine";

@Route.Prefix("/test")
export default class TestController {
  constructor() {
    Route.AddRoute(this, "get", "/test", () => this.index());
    Route.SetConfig(this, "prefix", "/test2");
    console.log(Route.GetRoutes(this));
    console.log(Route.GetConfig(this));
  }

  @Route.Get()
  async index() {
    console.log("first");
    return "HelloWorld";
  }
}
