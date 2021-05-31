// Http(Request/Response)
export const __request = Symbol('HttpRequestInstance');
export const __response = Symbol('HttpResponseInstance');

// HttpRequest symbols
export const reqHeaderResponse = Symbol('HttpRequestResponseHeaders');

// HttpResponse symbols
export const resHeaders = Symbol('HttpResponseHeaders');
export const resConfig = Symbol('HttpResponseConfig');
export const resAbortHandler = '___$HttpResponseAbortHandler';

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
