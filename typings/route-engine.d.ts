import { HttpHandler, PreparedRoute, UnpreparedRoute } from '../types/find-route';
import { HttpMethod, INanoexpressOptions } from '../types/nanoexpress';
import { HttpRequest, HttpResponse } from './polyfills';
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
    on(method: HttpMethod, path: string | RegExp | Array<string | RegExp>, handler: HttpHandler<HttpMethod, any> | HttpHandler<HttpMethod, any>[], baseUrl: string, originalUrl: string): this;
    off(method: HttpMethod, path: string, handler: HttpHandler<HttpMethod, any>, baseUrl: string, originalUrl: string): this;
    lookup(req: HttpRequest, res: HttpResponse): Promise<HttpResponse | string | void>;
}
//# sourceMappingURL=route-engine.d.ts.map