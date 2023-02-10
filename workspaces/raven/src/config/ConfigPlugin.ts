import { injectable } from 'tsyringe'
import { IPlugin } from '../plugin/IPlugin'
import { Raven } from '../raven/Raven'
import { ConfigLoader } from './ConfigLoader'
import { ConfigObjectProvider } from './ConfigObjectProvider'
import { ConfigProvider } from './ConfigProvider'

@injectable()
export class RavenConfigPlugin implements IPlugin {
  public readonly loader = new ConfigLoader(this)
  public readonly provider: ConfigProvider = new ConfigObjectProvider({})

  constructor(private readonly raven: Raven) {}

  onRegister(): void {
    this.raven.loader.addLoader('config', (f) => this.loader.load(f))
  }
}
