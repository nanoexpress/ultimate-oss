/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { ReadStream } from 'fs';
import uWS, { RecognizedString } from 'uWebSockets.js';
import { BrotliCompress, BrotliOptions, Deflate, Gzip, ZlibOptions } from 'zlib';
import { INanoexpressOptions } from '../../types/nanoexpress';
import { request as resRequest, resAbortHandler, resAbortHandlerExpose, resConfig, resEvents, resHeaders, response as resResponse } from '../constants';
import HttpRequest from './http-request';
declare class HttpResponse {
    [resRequest]: HttpRequest | null;
    [resResponse]: uWS.HttpResponse | null;
    protected [resHeaders]: Record<string, RecognizedString | null> | null;
    protected [resAbortHandler]: (() => void)[];
    protected [resAbortHandlerExpose]: boolean;
    protected [resConfig]: INanoexpressOptions;
    protected [resEvents]: EventEmitter | null;
    done: boolean;
    aborted: boolean;
    streaming: boolean;
    protected _headersSet: boolean;
    protected registered: boolean;
    protected mode: 'immediate' | 'queue' | 'cork';
    serialize?: (data: Record<string, unknown> | string | number | boolean) => string;
    compiledResponse?: string;
    statusCode: number;
    id: number;
    constructor(config: INanoexpressOptions);
    protected registerEvents(): this;
    on(eventName: string | symbol, eventArgument: (eventArgument?: unknown) => void): this;
    once(eventName: string | symbol, eventArgument: (eventArgument?: unknown) => void): this;
    off(eventName: string | symbol, eventArgument: (eventArgument?: unknown) => void): this;
    removeListener(eventName: string | symbol, eventArgument: (eventArgument?: unknown) => void): this;
    emit(eventName: string | symbol, eventArgument?: never): boolean;
    setResponse(res: uWS.HttpResponse, req: HttpRequest): this;
    end(body?: uWS.RecognizedString, closeConnection?: boolean): this;
    sse(body: ReadStream): this;
    protected _sse(body: ReadStream): this;
    protected _end(body?: uWS.RecognizedString, closeConnection?: boolean): this;
    status(code: number): this;
    writeHead(code: number | Record<string, RecognizedString>, headers?: Record<string, RecognizedString>): this;
    redirect(code: number | string, path?: string): this;
    sendStatus(code: number): this;
    send(data: Record<string, unknown> | string | number | boolean, closeConnection?: boolean): this;
    pipe(stream: ReadStream, size?: number, compressed?: boolean): this;
    stream(stream: ReadStream, size?: number, compressed?: boolean): this;
    protected _stream(stream: ReadStream, size?: number, compressed?: boolean): this;
    compressStream(stream: ReadStream, options?: BrotliOptions | ZlibOptions, priority?: string[]): BrotliCompress | Gzip | Deflate | null;
    sendFile(path: string, lastModified?: boolean, compressed?: boolean): this;
    write(chunk: uWS.RecognizedString | ArrayBuffer): this;
    exposeAborted(): this;
    onAborted(handler: () => void): this;
    getHeader(key: string): RecognizedString | null;
    hasHeader(key: string): boolean;
    setHeader(key: string, value: uWS.RecognizedString): this;
    set(key: string, value: uWS.RecognizedString): this;
    setHeaders(headers: Record<string, uWS.RecognizedString>): this;
    removeHeader(key: string): this;
    type(contentType: string): this;
}
export default HttpResponse;
//# sourceMappingURL=http-response.d.ts.map