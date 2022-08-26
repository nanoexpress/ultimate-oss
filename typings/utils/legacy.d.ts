import { MiddlewareHandler } from '../../types/find-route';
import { HttpMethod } from '../../types/nanoexpress';
import { HttpRequest, HttpResponse } from '../polyfills';
export declare type LegacyHttpHandler<T> = (req: HttpRequest<T>, res: HttpResponse, next: (err?: Error, done?: boolean) => void) => HttpResponse | string | Record<string, unknown> | Promise<HttpResponse | Record<string, unknown> | string>;
declare const _default: (middleware: LegacyHttpHandler<HttpMethod>) => MiddlewareHandler;
export default _default;
//# sourceMappingURL=legacy.d.ts.map