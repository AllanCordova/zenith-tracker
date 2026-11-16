import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
};

const CLIENT_ERRORS: Record<string, ErrorBody> = {
  P2000: errorBody(HttpStatus.BAD_REQUEST, 'Bad Request', 'Dados inválidos'),
  P2002: errorBody(HttpStatus.CONFLICT, 'Conflict', 'Registro duplicado'),
  P2003: errorBody(HttpStatus.BAD_REQUEST, 'Bad Request', 'Dados inválidos'),
  P2007: errorBody(HttpStatus.BAD_REQUEST, 'Bad Request', 'Dados inválidos'),
  P2011: errorBody(HttpStatus.BAD_REQUEST, 'Bad Request', 'Dados inválidos'),
  P2020: errorBody(HttpStatus.BAD_REQUEST, 'Bad Request', 'Dados inválidos'),
  P2023: errorBody(HttpStatus.BAD_REQUEST, 'Bad Request', 'Dados inválidos'),
  P2025: errorBody(HttpStatus.NOT_FOUND, 'Not Found', 'Registro não encontrado'),
  P2034: errorBody(HttpStatus.CONFLICT, 'Conflict', 'Registro em conflito'),
};

const UNAVAILABLE_CODES = new Set([
  'P1000',
  'P1001',
  'P1003',
  'P1008',
  'P1009',
  'P1010',
  'P1011',
  'P1017',
  'P1018',
  'P2037',
]);

const DATABASE_LEAK =
  /prisma|sqlstate|\bP\d{4}\b|violates\s+\w*\s*constraint|duplicate key|passwordHash|syntax error|unique constraint|driverAdapter/i;

function errorBody(
  statusCode: number,
  error: string,
  message: string,
): ErrorBody {
  return { statusCode, message, error };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mapPrisma(error: Record<string, unknown>): ErrorBody | undefined {
  const name = typeof error.name === 'string' ? error.name : '';
  const code = typeof error.code === 'string' ? error.code : '';
  const isPrismaCode =
    (name === 'UserFacingError' || name.includes('Prisma')) &&
    /^P\d{4}$/.test(code);

  if (isPrismaCode) {
    const known = CLIENT_ERRORS[code];
    if (known) {
      return known;
    }
    if (UNAVAILABLE_CODES.has(code)) {
      return errorBody(
        HttpStatus.SERVICE_UNAVAILABLE,
        'Service Unavailable',
        'Serviço indisponível',
      );
    }
    return errorBody(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal Server Error',
      'Internal server error',
    );
  }

  if (name === 'SqlQueryError' || error.kind === 'sql_query') {
    if (error.sqlState === '23505') {
      return errorBody(HttpStatus.CONFLICT, 'Conflict', 'Registro duplicado');
    }
    if (
      error.sqlState === '23503' ||
      error.sqlState === '23502' ||
      error.sqlState === '22001'
    ) {
      return errorBody(
        HttpStatus.BAD_REQUEST,
        'Bad Request',
        'Dados inválidos',
      );
    }
    return errorBody(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal Server Error',
      'Internal server error',
    );
  }

  if (name === 'SqlConnectionError' || error.kind === 'sql_connection') {
    return errorBody(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Service Unavailable',
      'Serviço indisponível',
    );
  }

  return undefined;
}

function prismaBody(exception: unknown): ErrorBody | undefined {
  const seen = new Set<unknown>();
  let current: unknown = exception;
  while (isRecord(current) && !seen.has(current)) {
    seen.add(current);
    const mapped = mapPrisma(current);
    if (mapped) {
      return mapped;
    }
    current = current.cause;
  }
  return undefined;
}

function sanitize(
  message: string | string[],
  statusCode: number,
): string | string[] {
  const raw = Array.isArray(message) ? message.join('\n') : message;
  if (!DATABASE_LEAK.test(raw)) {
    return message;
  }
  if (statusCode === HttpStatus.CONFLICT) {
    return 'Registro duplicado';
  }
  if (statusCode === HttpStatus.NOT_FOUND) {
    return 'Registro não encontrado';
  }
  if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    return 'Internal server error';
  }
  return 'Dados inválidos';
}

function httpExceptionBody(exception: HttpException): ErrorBody {
  const statusCode = exception.getStatus();
  let message: string | string[] = exception.message;
  let error = 'Error';
  const payload = exception.getResponse();

  if (typeof payload === 'string') {
    message = payload;
  } else if (isRecord(payload)) {
    if (typeof payload.message === 'string' || Array.isArray(payload.message)) {
      message = payload.message as string | string[];
    }
    if (typeof payload.error === 'string') {
      error = payload.error;
    }
  }

  return {
    statusCode,
    message: sanitize(message, statusCode),
    error,
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body =
      exception instanceof HttpException
        ? httpExceptionBody(exception)
        : (prismaBody(exception) ??
          errorBody(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Internal Server Error',
            'Internal server error',
          ));

    response.status(body.statusCode).json(body);
  }
}
