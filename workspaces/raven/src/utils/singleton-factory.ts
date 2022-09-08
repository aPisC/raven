export function singletonFactory<TResult = any, TArgs extends any[] = []>(callback: (...args: TArgs) => TResult) {
  let initialized: boolean = false
  let value: TResult | undefined

  return (...args: TArgs) => {
    if (initialized) return value
    value = callback(...args)
    initialized = true
    return value
  }
}
