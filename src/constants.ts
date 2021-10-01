// Http(Request/Response)
export const request: unique symbol = Symbol('HttpRequestInstance');
export const response: unique symbol = Symbol('HttpResponseInstance');

// HttpRequest symbols
export const reqHeaderResponse = Symbol('HttpRequestResponseHeaders');

// HttpResponse symbols
export const resHeaders: unique symbol = Symbol('HttpResponseHeaders');
export const resConfig: unique symbol = Symbol('HttpResponseConfig');
export const resAbortHandler: unique symbol = Symbol(
  'HttpResponseAbortHandler'
);
export const resAbortHandlerExpose: unique symbol = Symbol(
  'HttpResponseAbortHandlerExpose'
);

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
