import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export type UserRole = 'STUDENT' | 'TRAINER';

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateUserInput) {
    return this.prisma.db.orm.public.User.create({
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
    });
  }

  findByEmail(email: string) {
    return this.prisma.db.orm.public.User.first({ email });
  }

  findById(id: string) {
    return this.prisma.db.orm.public.User.first({ id });
  }
}
