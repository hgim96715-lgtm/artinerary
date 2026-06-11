import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/client';
import { Response } from 'express';
import { EnvKeys } from 'src/config/env.keys';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategy/jwt.strategy';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { nickname: dto.nickname }],
      },
      select: { email: true, nickname: true },
    });
    if (existing?.email === dto.email) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }
    if (existing?.nickname === dto.nickname) {
      throw new ConflictException('이미 존재하는 닉네임입니다.');
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        nickname: dto.nickname,
        passwordHash,
        role: Role.USER,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
      },
    });
    return {
      message: `${dto.nickname}님 회원가입 성공입니다 이메일로 로그인 해주세요.`,
      ...user,
    };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || user.role !== Role.ADMIN) {
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

    const token = await this.jwtService.signAsync(payload);
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
    return {
      message: '로그인 성공',
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    };
  }
  async logout(res: Response) {
    const cookieName = this.configService.getOrThrow<string>(
      EnvKeys.COOKIE_NAME,
    );
    res.clearCookie(cookieName, { path: '/' });
    return { message: '로그아웃 성공' };
  }
  async me(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { email: true, nickname: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }
}
