import { INestApplication } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Referrer-Policy', 'no-referrer'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
];

export function useSecurityHeaders(app: INestApplication): void {
  app.use((_req: Request, res: Response, next: NextFunction) => {
    for (const [name, value] of SECURITY_HEADERS) {
      res.setHeader(name, value);
    }
    next();
  });
}
