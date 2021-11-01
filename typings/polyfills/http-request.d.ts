/// <reference types="node" />
import { EventEmitter } from 'events';
import { Readable, Writable } from 'stream';
import { HttpRequest as uWS_HttpRequest, HttpResponse as uWS_HttpResponse } from 'uWebSockets.js';
import { RequestSchema, RequestSchemaWithBody } from '../../types/find-route';
import { HttpMethod, INanoexpressOptions } from '../../types/nanoexpress';
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
    constructor(options: INanoexpressOptions);
    setRequest(req: uWS_HttpRequest, res: uWS_HttpResponse): this;
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    getHeader(key: string): string;
    hasHeader(key: string): boolean;
    getParameter(index: number): string;
    pipe(destination: Writable): Writable | void | Promise<Error>;
    [Symbol.asyncIterator](): any;
}
//# sourceMappingURL=http-request.d.ts.map