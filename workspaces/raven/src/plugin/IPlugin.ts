export interface IPlugin {
  onRegister?: () => void
  onInitialize?: () => Promise<void> | void
  onStart?: () => Promise<void> | void
  onListen?: () => Promise<void> | void
}
