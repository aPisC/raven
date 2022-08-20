import { Raven } from "../raven/raven";

export abstract class Plugin {
  public abstract initialize(raven: Raven): void;
}
