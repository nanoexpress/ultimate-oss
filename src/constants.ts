// Http(Request/Response)
export const request: unique symbol = Symbol('HttpRequestInstance');
export const response: unique symbol = Symbol('HttpResponseInstance');

// HttpResponse symbols
export const resHeaders: unique symbol = Symbol('HttpResponseHeaders');
export const resConfig: unique symbol = Symbol('HttpResponseConfig');
export const resEvents: unique symbol = Symbol('HttpResponseEvents');
export const resAbortHandler: unique symbol = Symbol(
  'HttpResponseAbortHandler'
);
export const resAbortHandlerExpose: unique symbol = Symbol(
  'HttpResponseAbortHandlerExpose'
);
