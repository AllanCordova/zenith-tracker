import { ArgumentsHost, ConflictException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function capture() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

function userFacing(code: string, message: string): Error {
  const error = new Error(message);
  error.name = 'UserFacingError';
  return Object.assign(error, {
    code,
    meta: { table: 'User', target: ['email'], constraint: 'User_email_key' },
  });
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('keeps an intentional HttpException message', () => {
    const { host, status, json } = capture();

    filter.catch(new ConflictException('Este e-mail já existe'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'Este e-mail já existe',
      error: 'Conflict',
    });
  });

  it('maps a Prisma unique violation to 409 without the database message', () => {
    const { host, status, json } = capture();
    const leaked =
      'Unique constraint failed on the fields: (`email`). constraint User_email_key';

    filter.catch(userFacing('P2002', leaked), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const body = json.mock.calls[0][0] as Record<string, unknown>;
    expect(body).toEqual({
      statusCode: 409,
      message: 'Registro duplicado',
      error: 'Conflict',
    });
    expect(JSON.stringify(body)).not.toContain('email');
    expect(JSON.stringify(body)).not.toContain('User_email_key');
    expect(JSON.stringify(body)).not.toMatch(/constraint/i);
  });

  it('maps a missing Prisma record to 404 without the query text', () => {
    const { host, status, json } = capture();

    filter.catch(
      userFacing('P2025', 'Record to update not found on table "User"'),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Registro não encontrado',
      error: 'Not Found',
    });
  });

  it('maps a Prisma foreign key violation to 400 without column names', () => {
    const { host, status, json } = capture();

    filter.catch(
      userFacing('P2003', 'Foreign key constraint failed on the field: `userId`'),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const body = json.mock.calls[0][0] as Record<string, unknown>;
    expect(body).toEqual({
      statusCode: 400,
      message: 'Dados inválidos',
      error: 'Bad Request',
    });
    expect(JSON.stringify(body)).not.toContain('userId');
  });

  it('hides database credentials from a Prisma connection error', () => {
    const { host, status, json } = capture();

    filter.catch(
      userFacing(
        'P1000',
        'Authentication failed against the database server, the provided database credentials for `postgres` are not valid',
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    const body = json.mock.calls[0][0] as Record<string, unknown>;
    expect(body).toEqual({
      statusCode: 503,
      message: 'Serviço indisponível',
      error: 'Service Unavailable',
    });
    expect(JSON.stringify(body)).not.toContain('postgres');
    expect(JSON.stringify(body)).not.toMatch(/credential/i);
  });

  it('maps a SQL unique violation that escaped the driver to 409', () => {
    const { host, status, json } = capture();
    const error = new Error(
      'duplicate key value violates unique constraint "User_email_key"',
    );
    error.name = 'SqlQueryError';
    Object.assign(error, {
      kind: 'sql_query',
      sqlState: '23505',
      table: 'User',
      column: 'email',
      constraint: 'User_email_key',
      detail: 'Key (email)=(ana@example.com) already exists.',
    });

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const body = json.mock.calls[0][0] as Record<string, unknown>;
    expect(body).toEqual({
      statusCode: 409,
      message: 'Registro duplicado',
      error: 'Conflict',
    });
    expect(JSON.stringify(body)).not.toContain('ana@example.com');
    expect(JSON.stringify(body)).not.toContain('User_email_key');
  });

  it('replaces a database message that a HttpException tried to forward', () => {
    const { host, json } = capture();

    filter.catch(
      new ConflictException(
        'duplicate key value violates unique constraint "User_email_key"',
      ),
      host,
    );

    const body = json.mock.calls[0][0] as { message: string };
    expect(body.message).toBe('Registro duplicado');
    expect(JSON.stringify(body)).not.toContain('User_email_key');
  });

  it('hides an unexpected Error message and stack', () => {
    const { host, status, json } = capture();
    const error = new Error('select passwordHash from "User" where id = 1');

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = json.mock.calls[0][0] as Record<string, unknown>;
    expect(body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
    expect(JSON.stringify(body)).not.toContain('passwordHash');
    expect(JSON.stringify(body)).not.toMatch(/stack/i);
  });
});
