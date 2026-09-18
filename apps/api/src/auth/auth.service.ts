import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TRAINER';
};

type UserRecord = PublicUser & { passwordHash: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{
    accessToken: string;
    user: PublicUser;
  }> {
    const email = dto.email.toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email,
      passwordHash,
      role: dto.role,
    });

    return {
      accessToken: await this.signToken(user.id, user.role),
      user: this.toPublicUser(user),
    };
  }

  toPublicUser(user: UserRecord): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private signToken(userId: string, role: PublicUser['role']): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, role });
  }
}
