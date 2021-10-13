import { Key } from 'path-to-regexp';
import { HttpResponse } from '../src/polyfills';
import { HttpMethod, HttpRequest } from './nanoexpress';

export interface HttpRequestExtended<T> extends Omit<HttpRequest, 'method'> {
  method: T;
}

export type HttpHandler<T> = (
  req: HttpRequestExtended<T>,
  res: HttpResponse
) =>
  | HttpResponse
  | string
  | Record<string, unknown>
  | Promise<HttpResponse | Record<string, unknown> | string>;

export interface UnpreparedRoute {
  method: HttpMethod;
  path: string | RegExp;
  baseUrl: string;
  originalUrl?: string;
  handler: HttpHandler<HttpMethod>;
}

export interface PreparedRoute extends Omit<UnpreparedRoute, 'path'> {
  async: boolean;
  await: boolean;
  all: boolean;
  fetch_params: boolean;
  param_keys?: Key[];
  path: RegExp | string;
  baseUrl: string;
  originalPath: string | null;
  regex: boolean;
  legacy: boolean;
}
