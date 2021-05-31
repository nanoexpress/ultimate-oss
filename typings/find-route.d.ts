import { Key } from 'path-to-regexp';
import { HttpRequest } from 'uWebSockets.js';
import { HttpResponse } from '../src/polyfills';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'OPTIONS' | 'DEL' | 'ANY';
export type HttpHandler = (
  req: HttpRequest,
  res: HttpResponse
) => HttpResponse | void | Promise<HttpResponse> | Promise<void>;

export interface UnpreparedRoute {
  method: HttpMethod;
  path: string;
  handler: HttpHandler;
}

export interface PreparedRoute extends Omit<UnpreparedRoute, 'path'> {
  async: boolean;
  await: boolean;
  all: boolean;
  fetch_params: boolean;
  params_id?: Key[];
  path: RegExp | string;
  regex: boolean;
  legacy: boolean;
}
