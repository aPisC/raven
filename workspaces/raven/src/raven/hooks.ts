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

  async execute(): Promise<void> {
    for (const hook of this.hooks) {
      await hook(this.raven)
    }
  }

  clear() {
    this.hooks = []
  }
}

class SingleRunHookCollection extends HookCollection {
  override async execute(): Promise<void> {
    await super.execute()
    super.clear()
  }
}

type Hook = (raven: Raven) => void
