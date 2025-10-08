import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenService } from '../services/tokens.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly configService: ConfigService,
    private tokenService: TokenService,
  ) {
    const secret = configService.get('jwt').secret;

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any): Promise<any> {

    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');

    const isRevoked = await this.tokenService.isTokenInvalidated(token);
    if (isRevoked) {
      throw new UnauthorizedException('Token revoked');
    }

    return {
      id: payload.id,
      level: payload.level,
      isActive: payload.isActive,
      token,
    };
  }
}



@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    readonly configService: ConfigService,

  ) {
    const secret = configService.get('jwt').refreshSecret;

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.refresh_token
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request) {

    return {
      refreshToken: req.cookies?.refresh_token
    };
  }
}