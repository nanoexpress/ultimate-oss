import { RecognizedString, WebSocketBehavior } from 'uWebSockets.js';
import { MiddlewareHandler, RequestSchema, RequestSchemaWithBody, RouteHandler, UnpreparedRoute } from '../types/find-route';
import { HttpMethod, IWebsocketRoute } from '../types/nanoexpress';
import App from './app';
import { appInstance, routerInstances, wsInstances } from './constants';
import RouteEngine from './route-engine';
export default class Router {
    protected [appInstance]: App | Router;
    protected _engine?: RouteEngine;
    [routerInstances]: UnpreparedRoute[];
    [wsInstances]: IWebsocketRoute<any>[];
    _basePath: string;
    constructor();
    on<T>(method: HttpMethod, path: string | RegExp, handlers: MiddlewareHandler | MiddlewareHandler[] | RouteHandler<HttpMethod, T> | RouteHandler<HttpMethod, T>[], baseUrl: string, originalUrl: string): this;
    use(path: string | MiddlewareHandler | Router, ...middlewares: Array<MiddlewareHandler | Router>): this;
    get<T = RequestSchema>(path: string | RegExp, ...handlers: RouteHandler<'GET', T>[]): this;
    post<T = RequestSchemaWithBody>(path: string | RegExp, ...handlers: RouteHandler<'POST', T>[]): this;
    put<T = RequestSchemaWithBody>(path: string | RegExp, ...handlers: RouteHandler<'PUT', T>[]): this;
    options<T = RequestSchema>(path: string | RegExp, ...handlers: RouteHandler<'OPTIONS', T>[]): this;
    del<T = RequestSchema>(path: string | RegExp, ...handlers: RouteHandler<'DEL', T>[]): this;
    delete<T = RequestSchema>(path: string | RegExp, ...handlers: RouteHandler<'DEL', T>[]): this;
    all<T = RequestSchemaWithBody>(path: string | RegExp, ...handlers: RouteHandler<'ANY', T>[]): this;
    ws<UserData>(path: RecognizedString, options?: WebSocketBehavior<UserData>): this;
    publish(topic: RecognizedString, message: RecognizedString, isBinary?: boolean, compress?: boolean): boolean;
}
//# sourceMappingURL=router.d.ts.map