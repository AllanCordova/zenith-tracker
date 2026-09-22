import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { createDb } from './prisma/db';

jest.mock('./prisma/db', () => ({
  createDb: jest.fn(() => ({ orm: {}, close: jest.fn() })),
}));

describe('PrismaService', () => {
  it('obtém DATABASE_URL do ConfigService, não do process.env no import', () => {
    process.env.DATABASE_URL = 'postgresql://stale@import/db';
    const getOrThrow = jest.fn().mockReturnValue('postgresql://from-config/db');

    new PrismaService({ getOrThrow } as unknown as ConfigService);

    expect(getOrThrow).toHaveBeenCalledWith('DATABASE_URL');
    expect(createDb).toHaveBeenCalledWith('postgresql://from-config/db');
    expect(createDb).not.toHaveBeenCalledWith('postgresql://stale@import/db');
  });
});
