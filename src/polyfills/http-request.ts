/* eslint-disable max-lines, max-lines-per-function */
import { EventEmitter } from 'events';
import queryParse from 'fast-query-parse';
import { ParsedUrlQuery } from 'querystring';
import { Readable, Writable } from 'stream';
import {
  HttpRequest as uWS_HttpRequest,
  HttpResponse as uWS_HttpResponse
} from 'uWebSockets.js';
import { HttpMethod, INanoexpressOptions } from '../../types/nanoexpress';
import { reqConfig, reqEvents, reqRawResponse, reqRequest } from '../constants';
import { debug } from '../helpers';
import HttpResponse from './http-response';

export interface IDefaultHttpSchema {
  headers: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  query: ParsedUrlQuery | null;
}

export default class HttpRequest<
  THttpMethod = HttpMethod,
  THttpSchema extends IDefaultHttpSchema = IDefaultHttpSchema
> {
  protected [reqConfig]: INanoexpressOptions;

  protected [reqEvents]: EventEmitter | null;

  protected [reqRequest]: uWS_HttpRequest;

  protected [reqRawResponse]: uWS_HttpResponse;

  protected registered: boolean;

  baseUrl!: string;

  url!: string;

  originalUrl!: string;

  path!: string;

  method!: THttpMethod;

  headers!: THttpSchema['headers'];

  params?: THttpSchema['params'];

  body?: THttpSchema['body'];

  query: THttpSchema['query'] = null;

  stream: Readable | null = null;

  constructor(options: INanoexpressOptions) {
    this[reqConfig] = options;

    this.registered = false;

    return this;
  }

  protected registerEvents(): this {
    const emitter = this[reqEvents];

    if (emitter && !this.registered) {
      //
      this.registered = true;
    }

    return this;
  }

  /**
   * Registers event to response
   * @param eventName Event name
   * @param eventArgument Any argument
   * @returns nanoexpress.HttpResponse
   * @memberof nanoexpress.HttpResponse
   * @example res.on('end', (eventArgument) => {...})
   */
  on(
    eventName: string | symbol,
    eventArgument: (eventArgument?: unknown) => void
  ): this {
    let emitter = this[reqEvents];

    if (!emitter) {
      this[reqEvents] = new EventEmitter();
    }
    emitter = this[reqEvents] as EventEmitter;
    emitter.on(eventName, eventArgument);

    debug('res.on(%s, handler)', eventName);

    this.registerEvents();

    return this;
  }

  /**
   * Registers event to response to be fired once
   * @param eventName Event name
   * @param eventArgument Any argument
   * @returns nanoexpress.HttpResponse
   * @memberof nanoexpress.HttpResponse
   * @example res.once('end', (eventArgument) => {...})
   */
  once(
    eventName: string | symbol,
    eventArgument: (eventArgument?: unknown) => void
  ): this {
    let emitter = this[reqEvents];

    if (!emitter) {
      this[reqEvents] = new EventEmitter();
    }
    emitter = this[reqEvents] as EventEmitter;
    emitter.once(eventName, eventArgument);

    debug('res.once(%s, handler)', eventName);

    this.registerEvents();

    return this;
  }

  /**
   * Removes event from response
   * @param eventName Event name
   * @param eventArgument Any argument
   * @returns nanoexpress.HttpResponse
   * @memberof nanoexpress.HttpResponse
   * @example res.off('end', (eventArgument) => {...})
   */
  off(
    eventName: string | symbol,
    eventArgument: (eventArgument?: unknown) => void
  ): this {
    let emitter = this[reqEvents];

    if (!emitter) {
      return this;
    }
    emitter = this[reqEvents] as EventEmitter;
    emitter.off(eventName, eventArgument);

    debug('res.off(%s, handler)', eventName);

    this.registerEvents();

    return this;
  }

  /**
   * Removes listener from response
   * @param eventName Event name
   * @param eventArgument Any argument
   * @returns nanoexpress.HttpResponse
   * @memberof nanoexpress.HttpResponse
   * @example res.removeListener('end', (eventArgument) => {...})
   */
  removeListener(
    eventName: string | symbol,
    eventArgument: (eventArgument?: unknown) => void
  ): this {
    let emitter = this[reqEvents];

    if (!emitter) {
      return this;
    }
    emitter = this[reqEvents] as EventEmitter;
    emitter.removeListener(eventName, eventArgument);

    debug('res.removeListener(%s, handler)', eventName);

    this.registerEvents();

    return this;
  }

  /**
   * Emits event to response
   * @param eventName Event name
   * @param eventArgument Any argument
   * @returns Emit response
   * @memberof nanoexpress.HttpResponse
   * @example res.emit('end', 1)
   */
  emit(eventName: string | symbol, eventArgument?: never): boolean {
    let emitter = this[reqEvents];

    if (!emitter) {
      this[reqEvents] = new EventEmitter();
    }
    debug('res.emit(%s, argument)', eventName);

    emitter = this[reqEvents] as EventEmitter;
    return emitter.emit(eventName, eventArgument);
  }

  setRequest(req: uWS_HttpRequest, res: uWS_HttpResponse): this {
    const options = this[reqConfig];

    this[reqRequest] = req;
    this[reqRawResponse] = res;

    const query = req.getQuery();
    const url = req.getUrl();

    this.url = url;
    this.originalUrl = this.url;
    this.path = url;
    this.baseUrl = '';

    this.method = req.getMethod().toUpperCase() as unknown as THttpMethod;

    this.headers = {};
    req.forEach((key, value) => {
      (this.headers as IDefaultHttpSchema['headers'])[key] = value;
    });

    if (url.charAt(url.length - 1) !== '/') {
      this.url += '/';
      this.path += '/';
      this.originalUrl += '/';
    }

    if (options.enableExpressCompatibility && query) {
      this.originalUrl += `?${query}`;
    }
    this.query = queryParse(query);

    // Imitiate some modes
    this.stream = new Readable({ read(): void {} });

    // Protected variables
    this[reqEvents] = null;
    this.registered = false;

    return this;
  }

  getHeader(key: string): string {
    return this.headers[key];
  }

  hasHeader(key: string): boolean {
    return !!this.headers[key];
  }

  getParameter(index: number): string {
    return this[reqRequest].getParameter(index);
  }

  push(data: Buffer | null): this {
    const { stream } = this;

    if (data === null) {
      this.emit('end');
    } else {
      this.emit('data', data as never);
    }

    if (stream) {
      stream.push(data);
    }
    return this;
  }

  pipe(destination: Writable | HttpResponse): this {
    const { stream } = this;

    if (stream) {
      stream.pipe(destination as Writable);
    }

    return this;
  }

  drain(): void {
    this.stream = null;
  }
}
