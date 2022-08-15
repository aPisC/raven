interface ICallableInstance<TReturn, TArgs extends any[]> {
  (...args: TArgs): TReturn;
}

interface ICallableConstructor<TReturn, TArgs extends any[]> {
  new (): ICallableInstance<TReturn, TArgs>;
}

const CallableProxy: ICallableConstructor<any, any[]> = <any>(
  class CallableBase {
    protected declare __call__: (...args: any[]) => any;

    constructor() {
      return new Proxy(this, {
        apply: (target, thisArg, args) => target.__call__(target, ...args),
      });
    }
  }
);

export abstract class Callable<TReturn = void, TArgs extends any[] = []>
  extends CallableProxy
  implements ICallableInstance<TReturn, TArgs>
{
  protected abstract __call__(...args: TArgs): TReturn;
}
