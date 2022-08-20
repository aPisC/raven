import { Plugin, Raven } from "raven";

export default class RavenPluginAuth extends Plugin {
  initialize(raven: Raven): void {
    console.log("Registering plugin: ", this.constructor.name);
  }
}
