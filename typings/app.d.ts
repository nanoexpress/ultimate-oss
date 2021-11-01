/// <reference types="node" />
import { RecognizedString, TemplatedApp, us_listen_socket, WebSocketBehavior } from 'uWebSockets.js';
import { HttpHandler, RequestSchema } from '../types/find-route';
import { HttpMethod, INanoexpressOptions, IWebsocketRoute } from '../types/nanoexpress';
import { HttpRequest, HttpResponse } from './polyfills';
import RouteEngine from './route-engine';
import RouterTemplate from './router';
declare class App extends RouterTemplate {
    get https(): boolean;
    get _console(): Console;
    get raw(): TemplatedApp;
    protected _app: TemplatedApp;
    protected _options: INanoexpressOptions;
    protected _engine: RouteEngine;
    protected _ws: IWebsocketRoute[];
    protected _requestPools: HttpRequest[];
    protected _responsePools: HttpResponse[];
    protected _poolsSize: number;
    protected time: [number, number];
    protected _separateServed: boolean;
    protected _ran: boolean;
    protected _instance: Record<string, us_listen_socket | null>;
    protected defaultRoute: HttpHandler<HttpMethod, any> | null;
    protected errorRoute: ((err: Error, req: HttpRequest, res: HttpResponse) => void) | null;
    constructor(options: INanoexpressOptions, app: TemplatedApp);
    setNotFoundHandler(handler: HttpHandler<HttpMethod, RequestSchema>): this;
    setErrorHandler(handler: (err: Error, req: HttpRequest, res: HttpResponse) => void): this;
    handleError(error: Error, req: HttpRequest, res: HttpResponse): this;
    ws(path: RecognizedString, options: WebSocketBehavior): this;
    publish(topic: RecognizedString, message: RecognizedString, isBinary?: boolean, compress?: boolean): boolean;
    run(): this;
    listenSocket(port: number, host: string | undefined, is_ssl: boolean, handler: () => void): Promise<us_listen_socket>;
    listen(...args: Array<number | string | boolean | (() => void)>): Promise<us_listen_socket>;
    close(port: number, host?: string): boolean;
    protected _appApplyListen(host: string, port: number, is_ssl: boolean | undefined, handler: () => void): Promise<us_listen_socket>;
    _close(token: us_listen_socket | null, id: string): boolean;
    disable(tag: string): this;
    set(key: keyof INanoexpressOptions, value: string | number): this;
}
export default App;
//# sourceMappingURL=app.d.ts.map