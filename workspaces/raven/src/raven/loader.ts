import glob from "glob";
import { Raven } from "./raven";

export interface RavenLoaderConfig {
  controllers?: string[];
  models?: string[];
  root?: string;
}

export interface ModuleEntry {
  file: string;
  module: any;
}

export class RavenLoader {
  public load(raven: Raven, config: RavenLoaderConfig) {
    if (config.controllers?.length) {
      const controllers = this.loadModules(config.controllers, config.root);
      controllers.forEach(({ module, file }) => {
        try {
          if (!module) throw new Error("No default member exported");
          raven.useController(
            typeof module === "function" ? module : module.default
          );
        } catch (err: any) {
          console.warn("Unable to load controller", file, err);
        }
      });
    }

    if (config.models?.length) {
      const models = this.loadModules(config.models, config.root);
      models.forEach(({ module, file }) => {
        try {
          if (!module) throw new Error("No default member exported");
          console.log(module);
          raven.useModel(
            typeof module === "function" ? module : module.default
          );
        } catch (err: any) {
          console.warn("Unable to load model", file, err);
        }
      });
    }
  }

  private loadModules(globs: string[], root?: string): ModuleEntry[] {
    const modules: any[] = [];
    const files = globs
      .flatMap((p) => glob.sync(p, { cwd: root }))
      .map((f) => (root ? `${root}/${f}` : f));

    files.forEach((file) => {
      try {
        console.log("Loading", file);
        const module = require(file);
        modules.push({ module, file });
      } catch (err: any) {
        console.warn("Unable to load modul", file, err);
      }
    });

    return modules;
  }
}
