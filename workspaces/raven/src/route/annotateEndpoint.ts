import { AnnotationsSymbol } from './symbols'

export function annotateEndpoint(
  annotationKey: string | symbol,
  annotationValue: ((current: any) => any) | any
): ClassDecorator & MethodDecorator {
  return (target: Object | Function, propertyKey?: string | symbol) => {
    if (typeof target === 'function') target = target.prototype

    let annotations: any = propertyKey
      ? Reflect.getMetadata(AnnotationsSymbol, target, propertyKey)
      : Reflect.getMetadata(AnnotationsSymbol, target)
    annotations ??= {}

    const newAnnotations = {
      ...annotations,
      [annotationKey]:
        typeof annotationValue === 'function' ? annotationValue(annotations[annotationKey]) : annotationValue,
    }

    if (propertyKey) Reflect.defineMetadata(AnnotationsSymbol, newAnnotations, target, propertyKey)
    else Reflect.defineMetadata(AnnotationsSymbol, newAnnotations, target)
  }
}
