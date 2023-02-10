import * as Jwt from 'jsonwebtoken'
import { injectable } from 'tsyringe'

export interface AuthData {
  userId: number
  scopes: string[]
}

@injectable()
export default class AuthService {
  private readonly secret: string

  constructor(secret: string) {
    this.secret = secret
  }

  createJwt<TAuthData extends AuthData>(payload: TAuthData) {
    return Jwt.sign(payload, this.secret, {})
  }
}
