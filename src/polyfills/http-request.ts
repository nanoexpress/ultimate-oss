/* eslint-disable max-lines, max-lines-per-function */
import { EventEmitter } from 'events';
import queryParse from 'fast-query-parse';
import { Readable, Writable } from 'stream';
import {
  HttpRequest as uWS_HttpRequest,
  HttpResponse as uWS_HttpResponse
} from 'uWebSockets.js';
import { RequestSchema, RequestSchemaWithBody } from '../../types/find-route';
import { HttpMethod, INanoexpressOptions } from '../../types/nanoexpress';
import { reqConfig, reqEvents, reqRawResponse, reqRequest } from '../constants';
import { invalid } from '../helpers';

export default class HttpRequest<
  THttpMethod = HttpMethod,
  THttpSchema extends RequestSchemaWithBody = RequestSchema
> {
  protected [reqConfig]: INanoexpressOptions;

  protected [reqEvents]!: EventEmitter | null;

  protected [reqRequest]!: uWS_HttpRequest;

  protected [reqRawResponse]!: uWS_HttpResponse;

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

  stream!: Readable;

  id = 0;

  constructor(options: INanoexpressOptions) {
    this[reqConfig] = options;

    this.registered = false;

    return this;
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
      (this.headers as RequestSchema['headers'])[key] = value;
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

    // @ts-ignore
    if (this.method === 'POST' || this.method === 'PUT') {
      // Imitiate some modes
      this.stream = new Readable({ read(): void {} });

      // Protected variables
      this[reqEvents] = null;
      this.registered = false;
    }

    this.id = Math.round(Math.random() * 1e5);

    return this;
  }

  on(event: string, listener: (...args: any[]) => void): this {
    const { stream } = this;
    if (stream) {
      stream.on(event, listener);
    }
    return this;
  }

  emit(event: string, ...args: any[]): this {
    const { stream } = this;
    if (stream) {
      stream.emit(event, ...args);
    }
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

  pipe(destination: Writable): Writable | void | Promise<Error> {
    const { stream } = this;

    if (stream.readableDidRead || stream.readableEnded) {
      return invalid('Stream already used, cannot use one stream twice');
    }

    if (stream) {
      return stream.pipe(destination);
    }
    return invalid(
      'Stream was not defined, something wrong, please check your code or method is not a POST or PUT'
    );
  }

  async *[Symbol.asyncIterator](): any {
    const { stream } = this;

    if (stream) {
      for await (const chunk of stream) {
        yield chunk;
      }
    }
  }
}
