import { useSecurityHeaders } from './security-headers';

type HeaderMiddleware = (
  req: unknown,
  res: { setHeader: (name: string, value: string) => void },
  next: () => void,
) => void;

describe('useSecurityHeaders', () => {
  it('registers a middleware that sets security headers and continues the request', () => {
    let middleware: HeaderMiddleware | undefined;
    const app = {
      use(fn: HeaderMiddleware) {
        middleware = fn;
      },
    };

    useSecurityHeaders(app as never);

    const headers = new Map<string, string>();
    const next = jest.fn();
    middleware?.({}, { setHeader: (name, value) => headers.set(name, value) }, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()',
    );
  });
});
