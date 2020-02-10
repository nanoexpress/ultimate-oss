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

```js
app.setErrorHandler((err, req, res) => {
  if (checkSomething(err)) {
    res.send(sendSomething());
  }
});
```

Also available these methods

- `app.setErrorHandler(error: Error, req: HttpRequest, res: HttpResponse): HttpResponse`
- `app.setNotFoundHandler(req: HttpRequest, res: HttpResponse): HttpResponse`

[&laquo; Websocket](./websocket.md)

[Request &raquo;](./request.md)
