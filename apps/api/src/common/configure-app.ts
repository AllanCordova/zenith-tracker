import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { ResponseInterceptor } from './response.interceptor';

export function configureApp(app: INestApplication): void {
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
