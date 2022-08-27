import { injectable } from 'raven'

@injectable()
export default class AuthService {
  private readonly secret: string

  constructor(secret: string) {
    this.secret = secret
  }
}
