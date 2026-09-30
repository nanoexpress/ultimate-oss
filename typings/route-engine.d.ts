import type { HttpHandler, PreparedRoute, UnpreparedRoute } from '../types/find-route';
import type { HttpMethod, INanoexpressOptions } from '../types/nanoexpress';
import type { HttpRequest, HttpResponse } from './polyfills/index';
export default class RouteEngine {
    protected options: INanoexpressOptions;
    protected routes: PreparedRoute[];
    async: boolean;
    await: boolean;
    params: boolean;
    headers: boolean;
    cookies: boolean;
    query: boolean;
    body: boolean;
    property: boolean;
    constructor(options: INanoexpressOptions);
    parse(incomingRoute: UnpreparedRoute): PreparedRoute;
    on(method: HttpMethod | HttpMethod[], path: string | RegExp | Array<string | RegExp>, handler: HttpHandler<HttpMethod, unknown> | HttpHandler<HttpMethod, unknown>[], baseUrl: string, originalUrl: string): this;
    off(method: HttpMethod, path: string, handler: HttpHandler<HttpMethod, unknown>, baseUrl: string, originalUrl: string): this;
    lookup(req: HttpRequest, res: HttpResponse): Promise<HttpResponse | string | undefined>;
}
//# sourceMappingURL=route-engine.d.ts.map