import { Readable } from 'stream';
import {
  AppOptions as AppOptionsBasic,
  HttpRequest as HttpRequestBasic,
  HttpResponse as HttpResponseBasic,
  TemplatedApp as AppTemplatedApp,
  WebSocket as WebSocketBasic
} from 'uWebSockets.js';
import {
  BrotliCompress,
  BrotliOptions,
  Deflate,
  Gzip,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console?: Console | any;
    json_spaces?: number;
  }
  export type HttpRequestHeaders = Record<string, string | number>;
  export interface WebSocket extends WebSocketBasic {
    emit(name: string, ...args: string[] | number[] | void[]): void;

    on(
      event: 'message',
      listener: (message: string, isBinary?: boolean) => void
    ): void;
    on(event: 'drain', listener: (drain_amount: number) => void): void;
    on(event: 'close', listener: (code: number, message: string) => void): void;

    on(
      event: string,
      listener: (...args: string[] | number[] | void[]) => void
    ): void;
    once(
      event: string,
      listener: (...args: string[] | number[] | void[]) => void
    ): void;
    off(
      event: string,
      listener?: (...args: string[] | number[] | void[]) => void
    ): void;
  }
  export interface HttpResponse extends HttpResponseBasic {
    type(type: string): HttpResponse;
    status(code: number): HttpResponse;
    setHeader(key: string, value: string | number): HttpResponse;
    header(key: string, value: string | number): HttpResponse;
    hasHeader(key: string): HttpResponse;
    removeHeader(key: string): HttpResponse;
    applyHeadersAndStatus(): HttpResponse;
    setHeaders(headers: HttpRequestHeaders, overwrite?: boolean): HttpResponse;
    writeHeaderValues(name: string, value: string[]): HttpResponse;
    writeHeaders(headers: HttpRequestHeaders): HttpResponse;
    writeHead(code: number, headers: HttpRequestHeaders): HttpResponse;
    redirect(code: number | string, path?: string): HttpResponse;
    send(
      result: string | Record<string, string | number>,
      autoHeaders?: boolean
    ): HttpResponse;
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
    (req: HttpRequestBasic, res: HttpResponse) => nanoexpressApp
  >;
  type WsRoute = (req: HttpRequestBasic, ws: WebSocket) => void;
  export interface WebSocketOptions {
    compression?: number;
    maxPayloadLength?: number;
    idleTimeout?: number;
    upgrade?: PromiseLike<(req: HttpRequestBasic, res: HttpResponse) => void>;
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
      host: string,
      port: number,
      is_ssl_server?: boolean
    ): Promise<nanoexpressApp>;
    listen(
      host: string,
      port: number[],
      is_ssl_server?: boolean
    ): Promise<nanoexpressApp>;
    listen(
      ports: Array<{ port: number; host?: string }>
    ): Promise<nanoexpressApp>;
    close(host?: string, port?: number): boolean;
    setErrorHandler(
      errorHandlerCallback: (err: Error) => {
        status: 'error' | string;
        status_code: number;
        stack_trace: string;
        message: string;
        code: string;
      }
    ): nanoexpressApp;
    setNotFoundHandler(
      notFoundHandlerCallback: Promise<
        (req: HttpRequestBasic, res: HttpResponse) => HttpResponse
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
  // eslint-disable-next-line max-lines
): nanoexpress.nanoexpressApp;

export = nanoexpress;
