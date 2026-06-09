import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/client';
import { Response } from 'express';
import { EnvKeys } from 'src/config/env.keys';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategy/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || user.role === Role.ADMIN) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.signAsync(payload);
    const cookieName = this.configService.getOrThrow<string>(
      EnvKeys.COOKIE_NAME,
    );
    const isProd =
      this.configService.getOrThrow<string>(EnvKeys.NODE_ENV) === 'prod';
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { message: '로그인 성공', email: user.email, role: user.role };
  }
  async logout(res: Response) {
    const cookieName = this.configService.getOrThrow<string>(
      EnvKeys.COOKIE_NAME,
    );
    res.clearCookie(cookieName, { path: '/' });
    return { message: '로그아웃 성공' };
  }
  async me(user: JwtPayload) {
    return { email: user.email, role: user.role };
  }
}
