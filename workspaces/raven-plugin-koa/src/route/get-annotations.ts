import { AnnotationsSymbol } from './symbols'

export function getAnnotations(target: Object | Function, endpoint?: string | symbol) {
  if (typeof target === 'function') target = target.prototype

  const annotations: any = endpoint
    ? Reflect.getMetadata(AnnotationsSymbol, target, endpoint)
    : Reflect.getMetadata(AnnotationsSymbol, target)

  return annotations || {}
}
