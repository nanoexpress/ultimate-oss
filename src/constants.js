import { HttpResponse } from './response-proto/http/index.js';

export const HttpResponseKeys = Object.keys(HttpResponse);

// Http(Request/Response)
export const __request = Symbol('HttpRequestInstance');
export const __response = Symbol('HttpResponseInstance');

// HttpResponse symbols
export const resCookies = Symbol('HttpResponseCookies');
export const resHeaders = Symbol('HttpResponseHeaders');
