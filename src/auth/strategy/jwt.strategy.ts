import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from 'generated/prisma/client';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { EnvKeys } from 'src/config/env.keys';

export type JwtPayload = {
  sub: number;
  email: string;
  role: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const cookieName =
      configService.get<string>(EnvKeys.COOKIE_NAME) ?? 'artinerary-auth-token';
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.[cookieName] ?? null,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(EnvKeys.JWT_SECRET),
    });
  }
  async validate(payload: JwtPayload) {
    return payload;
  }
}
