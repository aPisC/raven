import { ConfigProvider } from './config-provider'

export class ConfigSectionProvider extends ConfigProvider {
  private readonly key: string
  private readonly base: ConfigProvider

  constructor(key: string, base: ConfigProvider) {
    super()
    if (base instanceof ConfigSectionProvider) {
      this.key = `${base.key}.${key}`
      this.base = base.base
    } else {
      this.key = key
      this.base = base
    }
  }

  set(key: string, value: any): void
  set(data: Object): void
  set(keyOrData: string | Object, value?: any): void {
    if (typeof keyOrData === 'object') this.base.set(this.key, keyOrData)
    else this.base.set(`${this.key}.${keyOrData}`, value)
  }

  get<T>(key: string): T | undefined
  get<T>(key: string, defaultValue: T): T
  get<T>(key: string, defaultValue?: T | undefined): T | undefined {
    return this.base.get(`${this.key}.${key}`, defaultValue)
  }

  getSection(key: string): ConfigProvider {
    return new ConfigSectionProvider(key, this)
  }
}
