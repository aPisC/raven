import { Citrine } from "../citrine";

export abstract class Plugin {
    abstract initialize(engine: Citrine): Promise<void> | void;
}