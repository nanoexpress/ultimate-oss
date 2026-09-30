import type { HttpRequest as uWS_HttpRequest, HttpResponse as uWS_HttpResponse } from 'uWebSockets.js';
import type { EventEmitter } from 'node:events';
import { Readable, type Writable } from 'node:stream';
import type { RequestSchema, RequestSchemaWithBody } from '../../types/find-route';
import type { HttpMethod, INanoexpressOptions } from '../../types/nanoexpress';
import { reqConfig, reqEvents, reqRawResponse, reqRequest } from '../constants';
export default class HttpRequest<THttpMethod = HttpMethod, THttpSchema extends RequestSchemaWithBody = RequestSchema> {
    protected [reqConfig]: INanoexpressOptions;
    protected [reqEvents]: EventEmitter | null;
    protected [reqRequest]: uWS_HttpRequest;
    protected [reqRawResponse]: uWS_HttpResponse;
    protected registered: boolean;
    baseUrl: string;
    url: string;
    originalUrl: string;
    path: string;
    method: THttpMethod;
    headers: THttpSchema['headers'];
    params?: THttpSchema['params'];
    body?: THttpSchema['body'];
    query: THttpSchema['query'];
    stream: Readable;
    id: number;
    constructor(options: INanoexpressOptions);
    setRequest(req: uWS_HttpRequest, res: uWS_HttpResponse): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
    emit(event: string, ...args: unknown[]): this;
    getHeader(key: string): string;
    hasHeader(key: string): boolean;
    getParameter(index: number): string;
    pipe(destination: Writable): Writable | undefined | Promise<Error>;
    [Symbol.asyncIterator](): unknown;
}
//# sourceMappingURL=http-request.d.ts.map