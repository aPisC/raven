import { flatten } from 'flattenizer'
import { ConfigProvider } from './config-provider'
import { ConfigSectionProvider } from './config-section-provider'

interface ConfigStore {
  [key: string]: any
}

export class ConfigObjectProvider extends ConfigProvider {
  constructor(initialData?: Object) {
    super()
    if (initialData) this.set(initialData)
  }

  private readonly _values: ConfigStore = {}
  public get values(): Readonly<ConfigStore> {
    return this._values
  }

  get<T>(key: string): T | undefined
  get<T>(key: string, defaultValue: T): T
  get<T>(key: string, defaultValue?: T): T | undefined {
    if (key in this._values) return this._values[key]
    return defaultValue
  }

  set(key: string, value: any): void
  set(data: Object): void
  set(keyOrData: string | Object, value?: any) {
    if (typeof keyOrData === 'string') {
      // Delete related entries if null
      if (value == null) {
        delete this._values[keyOrData]
        Object.keys(this._values)
          .filter((key) => key.startsWith(`${keyOrData}.`))
          .forEach((key) => delete this._values[key])
      }
      // flatten object value and set accordingly
      else if (typeof value === 'object') {
        const flatValues: any = flatten(value)
        Object.keys(flatValues).forEach((key) => this.set(`${keyOrData}.${key}`, flatValues[key]))
      } else {
        const keyConflict =
          Object.keys(this._values).find((key) => key.startsWith(`${keyOrData}.`)) ||
          Object.keys(this._values).find((key) => keyOrData.startsWith(`${key}.`))
        if (keyConflict) throw new Error(`Can not set ${keyOrData}, ${keyConflict} is already defined`)
        this._values[keyOrData] = value
      }
    }
    // Update all keys from object
    else {
      const flatValues: any = flatten(keyOrData)
      Object.keys(flatValues).forEach((key) => this.set(key, flatValues[key]))
    }
  }

  getSection(key: string): ConfigProvider {
    return new ConfigSectionProvider(key, this)
  }

  getRequired(key: string) {
    const value = this.get(key)
    if (value == null) throw new Error(`${key} is not configured`)
    return value
  }
}
