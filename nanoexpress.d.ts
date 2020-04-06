import {
  AppOptions as AppOptionsBasic,
  TemplatedApp as AppTemplatedApp,
  HttpRequest as HttpRequestBasic,
  HttpResponse as HttpResponseBasic,
  WebSocket as WebSocketBasic
} from 'uWebSockets.js';
import { Readable, Writable } from 'stream';
import {
  BrotliCompress,
  Gzip,
  Deflate,
  BrotliOptions,
  ZlibOptions
} from 'zlib';

declare namespace nanoexpress {
  export interface AppOptions extends AppOptionsBasic {
    https?: {
      key_file_name: string;
      cert_file_name: string;
      passphare: string;
      separateServer?: boolean | number;
    };
    isSSL?: boolean;
    console?: Console | any;
    json_spaces?: number;
  }
  export interface WebSocket extends WebSocketBasic {
    on(name: string, listener: Function);
    once(name: string, listener: Function);
    off(name: string, listener?: Function);
    emit(name: string, ...args: any[]);
  }
  export interface HttpResponse extends HttpResponseBasic {
    type(type: string): HttpResponse;
    status(code: number): HttpResponse;
    setHeader(key: string, value: string | number): HttpResponse;
    header(key: string, value: string | number): HttpResponse;
    hasHeader(key: string): HttpResponse;
    removeHeader(key: string): HttpResponse;
    applyHeadersAndStatus(): HttpResponse;
    setHeaders(headers: HttpRequestHeaders): HttpResponse;
    writeHeaderValues(name: string, value: string[]): HttpResponse;
    writeHeaders(headers: HttpRequestHeaders): HttpResponse;
    writeHead(code: number, headers: HttpRequestHeaders): HttpResponse;
    redirect(code: number | string, path?: string): HttpResponse;
    send(result: string | object | any[]): HttpResponse;
    pipe(
      callback: (pipe: Readable) => void,
      size?: number,
      compressed?: boolean
    ): HttpResponse;
    compressStream(
      stream: ReadableStream,
      options: BrotliOptions | ZlibOptions
    ): BrotliCompress | Gzip | Deflate | null;
    sendFile(
      filename: string,
      lastModified?: boolean,
      compressed?: boolean
    ): HttpResponse;
  }

  type MiddlewareRoute = Promise<
    (req: HttpRequest, res: HttpResponse) => nanoexpressApp
  >;
  type WsRoute = (req: HttpRequest, ws: WebSocket) => any;
  export interface WebSocketOptions {
    compression?: number;
    maxPayloadLength?: number;
    idleTimeout?: number;
  }

  interface nanoexpressAppInterface {
    define(callback: (app: nanoexpressApp) => void): nanoexpressApp;
    use(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    use(...middlewares: MiddlewareRoute[]): nanoexpressApp;

    get(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    post(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    put(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    patch(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    del(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    options(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    any(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    head(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    trace(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    ws(path: string, fn: WsRoute): nanoexpressApp;
    ws(path: string, options: WebSocketOptions, fn: WsRoute): nanoexpressApp;

    publish(
      topic: string,
      message: string,
      isBinary?: boolean,
      compress?: boolean
    ): nanoexpressApp;

    listen(
      port: number,
      host?: string,
      is_ssl_server?: boolean
    ): Promise<nanoexpressApp>;
    listen(
      port: number[],
      host?: string,
      is_ssl_server?: boolean
    ): Promise<nanoexpressApp>;
    listen(
      host?: string,
      port: number,
      is_ssl_server?: boolean
    ): Promise<nanoexpressApp>;
    listen(
      host?: string,
      port: number[],
      is_ssl_server?: boolean
    ): Promise<nanoexpressApp>;
    listen(
      ports: Array<{ port: number; host?: string }>
    ): Promise<nanoexpressApp>;
    close(host?: string, port?: number): boolean;
    setErrorHandler(
      errorHandlerCallback: (
        err: Error
      ) => {
        status: 'error' | string;
        status_code: number;
        stack_trace: string;
        message: string;
        code: string;
      }
    ): nanoexpressApp;
    setNotFoundHandler(
      notFoundHandlerCallback: Promise<
        (req: HttpRequest, res: HttpResponse) => HttpResponse
      >
    ): nanoexpressApp;
    config: AppOptions;
  }

  export interface nanoexpressApp
    extends Omit<AppTemplatedApp, keyof nanoexpressAppInterface>,
      nanoexpressAppInterface {}
}

declare function nanoexpress(
  options?: nanoexpress.AppOptions
): nanoexpress.nanoexpressApp;

export = nanoexpress;
