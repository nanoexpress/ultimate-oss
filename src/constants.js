import { HttpResponse } from './polyfills/http-response/index.js';

export const HttpResponseKeys = Object.keys(HttpResponse);

// Http(Request/Response)
export const __request = Symbol('HttpRequestInstance');
export const __response = Symbol('HttpResponseInstance');

// HttpResponse symbols
export const resCookies = Symbol('HttpResponseCookies');
export const resHeaders = Symbol('HttpResponseHeaders');
export const resConfig = Symbol('HttpResponseConfig');

export const httpMethods = [
  'get',
  'post',
  'put',
  'patch',
  'del',
  'any',
  'head',
  'options',
  'trace'
];
export const httpPrefix = 'http://';
export const httpsPrefix = 'https://';
