import { Raven } from './raven'

export class RavenHooks {
  constructor(private readonly raven: Raven) {}

  public readonly initialize = new SingleRunHookCollection(this.raven)
  public readonly start = new HookCollection(this.raven)
}

class HookCollection {
  /**
   *
   */
  constructor(public readonly raven: Raven) {}
  private hooks: Hook[] = []

  add(hook: Hook) {
    this.hooks.push(hook)
  }

  execute() {
    this.hooks.forEach((hook) => hook(this.raven))
  }

  clear() {
    this.hooks = []
  }
}

class SingleRunHookCollection extends HookCollection {
  override execute(): void {
    super.execute()
    super.clear()
  }
}

type Hook = (raven: Raven) => void
