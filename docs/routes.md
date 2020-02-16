# Routes

Stability tip: _Don't forget return `HttpResponse` from route_

Performance tip: _Using many middlewares may slow response performance_

## Route-middleware route

```js
import Route from 'nanoexpress/src/Route';

const route = new Route();

// To working properly, first apply `app.use(route)`
// and then set `route.get(...)`, else this not works
// properly yet
app.use(route);

route.get('/', async () => 'hello world');
```

## Async route

### Basic Async example

```js
app.get('/', async () => ({ status: 'success' }));
```

### Just example

```js
app.get('/', async (req, res) => {
  const result = await db.getUser(req.params.id);

  return result;
});
```

### Basic example

```js
app.get('/', async (req, res) => {
  return res.end('hello world');
});
```

### JSON example

```js
app.post('/', (req, res) => {
  const { body } = req;

  res.send({ status: 'ok' });
});
```

## Error handling example

```ts
interface ErrorHandlerResponse {
  status!: 'success' | 'error';
  status_code?: number; // response status code in `int` format
  stack_trace?: string; // error stack trace
  message!: string;
  code?: string; // auth_failed, bad_request, ...
}
app.setErrorHandler(
  (err: Error): ErrorHandlerResponse => {
    if (checkSomething(err)) {
      return {
        status: 'error',
        status_code: 500,
        message: 'oops'
      }
    }
  }
);
```

Also available these methods

- `app.setNotFoundHandler(req: HttpRequest, res: HttpResponse): HttpResponse`

[&laquo; Websocket](./websocket.md)

[Request &raquo;](./request.md)
