export abstract class ConfigProvider {
  abstract get<T>(key: string): T | undefined
  abstract get<T>(key: string, defaultValue: T): T

  abstract set(key: string, value: any): void
  abstract set(data: Object): void

  abstract getSection(key: string): ConfigProvider

  abstract getRequired(key: string): any
}
