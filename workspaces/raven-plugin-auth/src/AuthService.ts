import * as Jwt from 'jsonwebtoken'
import { injectable } from 'raven'

@injectable()
export default class AuthService {
  private readonly secret: string

  constructor(secret: string) {
    this.secret = secret
  }

  createJwt(payload: any) {
    return Jwt.sign(payload, this.secret, {})
  }
}
