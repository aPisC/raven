export interface RavenLoaderConfig {
  root?: string
  [key: string]: string[] | string | undefined
}

export interface ModuleEntry {
  file: string
  module: any
}

export type RegisterFn = (module: any, file: string, err: Error | null) => void

export interface RequireMap {
  [ext: string]: null | ((file: string) => any)
}

export interface LoaderHandler {
  register: RegisterFn
  require: (fn: string) => any
}
