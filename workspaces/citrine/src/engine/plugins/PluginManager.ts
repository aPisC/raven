import { Plugin } from "./Plugin";

export class PluginManager{
    private __plugins : Plugin[] = [];
    private __lock : boolean = false;

    public get plugins() : ReadonlyArray<Plugin> {
        return this.__plugins
    }

    public register(plugin: Plugin) {
        if(this.__lock)
          throw new Error("Plugin can not be registered, plugin registration is locked.")

        this.__plugins.push(plugin);
    }

    public lock(){
        this.__lock = true;
    }
}