import type { MiddlewareHandler } from '../../types/find-route';
import type { HttpMethod } from '../../types/nanoexpress';
import { warn } from '../helpers/loggy';
import type { HttpRequest, HttpResponse } from '../polyfills/index';

export type LegacyHttpHandler<T> = (
  req: HttpRequest<T>,
  res: HttpResponse,
  next: (err?: Error, done?: boolean) => void
) =>
  | HttpResponse
  | string
  | Record<string, unknown>
  | Promise<HttpResponse | Record<string, unknown> | string>;

export default (
  middleware: LegacyHttpHandler<HttpMethod>
): MiddlewareHandler => {
  warn(
    'legacy middlewares is deprecated and in future we will remove express.js middlewares support'
  );
  const httpHandler = function legacyMiddlewarePolyfillHandler(
    req: HttpRequest,
    res: HttpResponse
  ): Promise<undefined> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new Promise((resolve, reject) =>
      middleware(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      })
    );
  };
  const displayName = middleware.name;
  httpHandler.raw = middleware;
  httpHandler.displayName = displayName;
  return httpHandler;
};
