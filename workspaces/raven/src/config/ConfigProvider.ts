export abstract class ReadonlyConfigProvider {
  abstract get<T>(key: string): T | undefined
  abstract get<T>(key: string, defaultValue: T): T

  abstract getSection(key: string): ReadonlyConfigProvider

  abstract getRequired(key: string): any

  abstract getKeys(): string[]

  abstract getObject(): any
}

export abstract class ConfigProvider extends ReadonlyConfigProvider {
  abstract set(key: string, value: any): void
  abstract set(data: Object): void

  abstract override getSection(key: string): ConfigProvider

  copyFrom(provider: ConfigProvider) {
    provider.getKeys().forEach((key) => this.set(key, provider.get(key)))
  }
}

export class ConfigEmptyProvider extends ReadonlyConfigProvider {
  get<T>(key: string): T | undefined
  get<T>(key: string, defaultValue: T): T
  get<T>(): T | T | undefined {
    return undefined
  }

  getSection(): ReadonlyConfigProvider {
    return this
  }

  getRequired(key: string) {
    throw new Error(`${key} is not configured`)
  }

  getKeys(): string[] {
    return []
  }

  getObject() {
    return {}
  }
}
