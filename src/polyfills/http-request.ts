// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines-per-function */

import type {
  HttpRequest as uWS_HttpRequest,
  HttpResponse as uWS_HttpResponse
} from 'uWebSockets.js';
import type { EventEmitter } from 'node:events';
import { Readable, type Writable } from 'node:stream';
import queryParse from 'fast-query-parse';
import type {
  RequestSchema,
  RequestSchemaWithBody
} from '../../types/find-route';
import type { HttpMethod, INanoexpressOptions } from '../../types/nanoexpress';
import { reqConfig, reqEvents, reqRawResponse, reqRequest } from '../constants';
import { invalid } from '../helpers/index';

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

    if (
      this.method === 'POST' ||
      this.method === 'PUT' ||
      this.method === 'PATCH'
    ) {
      // Imitiate some modes
      this.stream = new Readable({
        read(): void {
          //
        }
      });

      // Protected variables
      this[reqEvents] = null;
      this.registered = false;
    }

    this.id = Math.round(Math.random() * 1e5);

    return this;
  }

  on(event: string, listener: (...args: unknown[]) => void): this {
    const { stream, method } = this;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      stream.on(event, listener);
    }
    return this;
  }

  emit(event: string, ...args: unknown[]): this {
    const { stream, method } = this;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
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

  pipe(destination: Writable): Writable | undefined | Promise<Error> {
    const { stream, method } = this;

    if (stream.readableDidRead || stream.readableEnded) {
      invalid('Stream already used, cannot use one stream twice');
      return;
    }

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      return stream.pipe(destination);
    }
    invalid(
      'Stream was not defined, something wrong, please check your code or method is not a POST or PUT'
    );
    return;
  }

  async *[Symbol.asyncIterator](): unknown {
    const { stream, method } = this;

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      for await (const chunk of stream) {
        yield chunk;
      }
    }
  }
}
