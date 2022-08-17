import { AnnotationsSymbol } from "./symbols";

export function annotateEndpoint<T extends Object>(
  annotationKey: string | symbol,
  annotationValue: any
): MethodDecorator {
  return (target, propertyKey) => {
    const annotations: any =
      Reflect.getMetadata(AnnotationsSymbol, target, propertyKey) || {};

    const newAnnotations = { ...annotations, [annotationKey]: annotationValue };

    Reflect.defineMetadata(
      AnnotationsSymbol,
      newAnnotations,
      target,
      propertyKey
    );
  };
}
