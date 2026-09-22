import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDb, type Db } from './prisma/db';

@Injectable()
export class PrismaService {
  readonly db: Db;

  constructor(config: ConfigService) {
    this.db = createDb(config.getOrThrow<string>('DATABASE_URL'));
  }
}
