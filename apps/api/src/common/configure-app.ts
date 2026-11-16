import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { ResponseInterceptor } from './response.interceptor';
import { useSecurityHeaders } from './security-headers';
import { setupSwagger } from './setup-swagger';

const UI_ORIGIN = 'http://localhost:3001';

export function configureApp(app: INestApplication): void {
  useSecurityHeaders(app);
  app.enableCors({ origin: UI_ORIGIN });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  setupSwagger(app);
}
