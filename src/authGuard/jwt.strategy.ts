import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "lzxlzx", // replace with your secret key
    })
  }

  async validate(payload: any) {
    // You could add more validation logic here
    if (!payload) {
      throw new UnauthorizedException()
    }
    return payload
  }
}
