import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { User } from '@prisma/client';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(this.configService.getOrThrow<string>('JWT_EXPIRATION')),
    );

    const tokenPayload: TokenPayload = {
      UserId: user.id,
    };
    const token = this.jwtService.sign(tokenPayload);
    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      expires,
    });

    return tokenPayload;
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({ email });
      const authtenticated = await bcrypt.compare(password, user.password);

      if (!authtenticated) throw new UnauthorizedException();

      return user;
    } catch {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  verifyToken(token: string) {
    this.jwtService.verify(token);
  }
}
