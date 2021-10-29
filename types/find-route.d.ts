import { IBlock } from '@nanoexpress/route-syntax-parser/types/interfaces';
import { Key } from 'path-to-regexp';
import { ParsedUrlQuery } from 'querystring';
import { HttpRequest, HttpResponse } from '../src/polyfills';
import { HttpMethod } from './nanoexpress';

export type RouteHandler<THttpMethod, THttpSchema> = (
  // @ts-ignore
  req: HttpRequest<THttpMethod, THttpSchema>,
  res: HttpResponse
) => HttpResponse | Promise<HttpResponse | Record<string, unknown> | string>;

export interface RequestSchema {
  headers: Record<string, string>;
  params?: Record<string, string>;
  query?: ParsedUrlQuery | null;
}
export interface RequestSchemaWithBody extends RequestSchema {
  body?: any;
}

export type MiddlewareHandler = (
  req: HttpRequest<HttpMethod, any>,
  res: HttpResponse
) => HttpResponse | Promise<HttpResponse | void>;

export type HttpHandler<THttpMethod, THttpSchema> =
  | MiddlewareHandler
  | RouteHandler<THttpMethod, THttpSchema>;

export interface UnpreparedRoute {
  method: HttpMethod;
  path: string | RegExp;
  baseUrl: string;
  originalUrl: string;
  handler: HttpHandler<HttpMethod, any>;
}

export interface PreparedRoute extends Omit<UnpreparedRoute, 'path'> {
  async: boolean;
  await: boolean;
  all: boolean;
  fetch_params: boolean;
  param_keys?: Key[];
  path: RegExp | string;
  baseUrl: string;
  regex: boolean;
  legacy: boolean;
  analyzeBlocks: IBlock[];
}
