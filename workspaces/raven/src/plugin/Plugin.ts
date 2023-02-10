import { injectable } from 'tsyringe'
import { RavenConfigPlugin } from '../config/ConfigPlugin'
import { ConfigEmptyProvider, ReadonlyConfigProvider } from '../config/ConfigProvider'
import { Raven } from '../raven/Raven'
import { IPlugin } from './IPlugin'

@injectable()
export class Plugin implements IPlugin {
  protected config: ReadonlyConfigProvider = new ConfigEmptyProvider()
  protected readonly raven: Raven

  constructor(raven: Raven) {
    this.raven = raven
  }

  /**
   * Auto called on plugin registration
   * Override onRegistration to provide factories
   * and resource registration capabilities.
   *
   * Plugin config is not available in this phase
   */
  onRegister(): void {}

  /**
   * Auto called on the startup phase
   * Override this function to interact with
   * other plugin's resource registrations
   */
  onInitialize(): Promise<void> | void {}

  /**
   * Auto called after initialization hooks in
   * the startup phase. This hook can contain asynchronous
   * logic for plugin initialization.
   * Use this hook to establish connection
   * to background servises
   */
  onStart(): Promise<void> | void {}

  /**
   * Auto called after start hooks.
   * All services that listens to some kind of
   * connection, should be started here.
   */
  onListen(): Promise<void> | void {}

  /**
   * Provide configuration for the plugin with callback or config object.
   * Config is resolved in the initialization phase.
   */

  configureFrom(sectionKey: string) {
    const configPlugin = this.raven.resolve(RavenConfigPlugin)
    const config = configPlugin.provider.getSection(sectionKey)
    this.config = config
  }
}
