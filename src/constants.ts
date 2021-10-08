// Http(Request/Response)
export const request: unique symbol = Symbol('NanoexpressHttpRequestInstance');
export const response: unique symbol = Symbol(
  'NanoexpressHttpResponseInstance'
);

// HttpResponse symbols
export const resHeaders: unique symbol = Symbol(
  'NanoexpressHttpResponseHeaders'
);
export const resConfig: unique symbol = Symbol('NanoexpressHttpResponseConfig');
export const resEvents: unique symbol = Symbol('NanoexpressHttpResponseEvents');
export const resAbortHandler: unique symbol = Symbol(
  'NanoexpressHttpResponseAbortHandler'
);
export const resAbortHandlerExpose: unique symbol = Symbol(
  'NanoexpressHttpResponseAbortHandlerExpose'
);

export const appInstance: unique symbol = Symbol('NanoexpressAppInstance');
export const routerInstances: unique symbol = Symbol(
  'NanoexpressRouterInstances'
);
export const wsInstances: unique symbol = Symbol(
  'NanoexpressWebSocketInstances'
);
