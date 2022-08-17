import { AnnotationsSymbol } from "./symbols";

export function getAnnotations(target: Object, endpoint: string | symbol) {
  const annotations: any =
    Reflect.getMetadata(AnnotationsSymbol, target, endpoint) || {};

  return annotations;
}
