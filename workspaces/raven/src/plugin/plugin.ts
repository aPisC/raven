import { ConfigProvider } from '../config/config-provider'
import { Raven } from '../raven/raven'

type ConfigHook<TConfig> = (opt: Partial<TConfig>, config: ConfigProvider, raven: Raven) => void

export abstract class Plugin<TConfig extends Object = any> {
  private readonly configHooks: ConfigHook<TConfig>[] = []
  protected readonly config: Partial<TConfig> = {}

  /**
   * Auto called on plugin registration
   * Override onRegistration to provide factories
   * and resource registration capabilities.
   *
   * Plugin config is not available in this phase
   */
  onRegister(raven: Raven): void {}

  /**
   * Auto called on the startup phase
   * Override this function to interact with
   * other plugin's resource registrations
   */
  onInitialize(raven: Raven): void {
    this.configHooks.forEach((hook) => hook(this.config, raven.config, raven))
  }

  /**
   * Auto called after initialization hooks in
   * the startup phase. This hook can contain asynchronous
   * logic for plugin initialization.
   * Use this hook to establish connection
   * to background servises
   */
  async onStart(raven: Raven): Promise<void> {}

  /**
   * Auto called after start hooks.
   * All services that listens to some kind of
   * connection, should be started here.
   */
  onListen(raven: Raven) {}

  /**
   * Provide configuration for the plugin with callback or config object.
   * Config is resolved in the initialization phase.
   */
  configure(configure: ConfigHook<TConfig>): void
  configure(configure: Partial<TConfig>): void
  configure(configure: ConfigHook<TConfig> | Partial<TConfig>) {
    if (typeof configure === 'function') this.configHooks.push(configure)
    else this.configHooks.push((opt) => Object.assign(opt, configure))
  }
}
