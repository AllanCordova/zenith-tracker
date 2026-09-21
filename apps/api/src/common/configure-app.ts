import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { ResponseInterceptor } from './response.interceptor';

const UI_ORIGIN = 'http://localhost:3001';

export function configureApp(app: INestApplication): void {
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
}
