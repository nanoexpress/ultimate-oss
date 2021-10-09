import {
  HttpHandler,
  HttpMethod,
  HttpRequestExtended
} from '../../types/find-route';
import HttpResponse from '../polyfills/http-response';

type LegacyHttpHandler<T> = (
  req: HttpRequestExtended<T>,
  res: HttpResponse,
  next: (err?: Error, done?: boolean) => void
) =>
  | HttpResponse
  | string
  | Record<string, unknown>
  | Promise<HttpResponse | Record<string, unknown> | string>;

export default (
  middleware: LegacyHttpHandler<HttpMethod>
): HttpHandler<HttpMethod> => {
  const httpHandler = (
    req: HttpRequestExtended<HttpMethod>,
    res: HttpResponse
  ): Promise<HttpResponse> =>
    new Promise((resolve, reject) => {
      middleware(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          // @ts-ignore
          resolve();
        }
      });
    });
  httpHandler.raw = middleware;
  return httpHandler;
};
