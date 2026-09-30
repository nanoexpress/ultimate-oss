import type { MiddlewareHandler } from '../../types/find-route';
import type { HttpMethod } from '../../types/nanoexpress';
import type { HttpRequest, HttpResponse } from '../polyfills/index';
export type LegacyHttpHandler<T> = (req: HttpRequest<T>, res: HttpResponse, next: (err?: Error, done?: boolean) => void) => HttpResponse | string | Record<string, unknown> | Promise<HttpResponse | Record<string, unknown> | string>;
export default _default;
declare function _default(middleware: LegacyHttpHandler<HttpMethod>): MiddlewareHandler;
//# sourceMappingURL=legacy.d.ts.map