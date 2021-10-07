import { Key } from 'path-to-regexp';
import { HttpRequest } from 'uWebSockets.js';
import { HttpResponse } from '../src/polyfills';

export interface HttpRequestExtended<T> extends HttpRequest {
  method: T;
  path: string;
  params?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'OPTIONS' | 'DEL' | 'ANY';
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
  handler: HttpHandler<HttpMethod>;
}

export interface PreparedRoute extends Omit<UnpreparedRoute, 'path'> {
  async: boolean;
  await: boolean;
  all: boolean;
  fetch_params: boolean;
  param_keys?: Key[];
  path: RegExp | string;
  originalPath: string | null;
  regex: boolean;
  legacy: boolean;
}
