import { Raven } from './raven'

type Hook = (raven: Raven) => void

export class RavenHooks {
  constructor(private readonly raven: Raven) {}

  public readonly initialize = new HookCollection(this.raven)
  public readonly start = new HookCollection(this.raven)
  public readonly listen = new HookCollection(this.raven)
}

class HookCollection {
  private hooks: Hook[] = []

  constructor(public readonly raven: Raven) {}

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
