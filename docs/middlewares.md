# Middlewares

Note: _You can use almost any [express](https://expressjs.com) middleware without issues, if you facing with issues, let me know, we will solve issue together_

## Built-in Middlewares

Built-in middlewares implemented at layer-level for performance reason and enables automacilly when needed, not always

### All of these things are already implemented in `nanoexpress`

| Alternative                                                            | Implement level | Which libraries uses                                                   |
| ---------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------- |
| [cookie](https://github.com/jshttp/cookie)                             | Layer level     | [cookie](https://github.com/jshttp/cookie)                             |
| [body-parser](https://github.com/expressjs/body-parser)                | Packed level    | Node.js builtin [querystring](https://nodejs.org/api/querystring.html) |
| [express-ws](https://github.com/HenningM/express-ws)                   | Core level      | [Core](https://github.com/uNetworking/uWebSockets.js) library          |
| [express-serializer](https://github.com/MediaComem/express-serializer) | Layer level     | [fast-json-stringify](https://github.com/fastify/fast-json-stringify)  |
| [express-ajv](https://bitbucket.org/netgenes/express-ajv)              | Layer level     | [ajv](https://ajv.js.org)                                              |

## In-box Middlewares

I'm excluded in-box modules from initialization for performance reason

### How-to import

```js
import { middlewares } from 'nanoexpress-pro/packed';
// or import { passportInitialize } from 'nanoexpress/packed/middlewares';

const app = nanoexpress();
app.use(middlewares.passportInitialize()); // or app.use(passportInitialize());
```

### Async example

```js
app.use(async (req, res) => {
  req.myAsyncWork = await fetchMyThing(req);
});
```

### Method defining

```js
function lazyEnd(end) {
  setTimeout(() => this.end(end), 0);
}
app.use(async (req, res) => {
  res.lazyEnd = lazyEnd;
});
```

## Known Bugs

### CORS per-route bug

Note: _This bug can be fixed, bug we used this way to improve performance and reduce latency between requests_

There only one workaround to this

```js
const corsPerRoute = cors();
app.options('/my-route', corsPerRoute, () => {});

app.get('/my-route', corsPerRoute, (req, res) => {
  res.send('this route protected by your cors per-route config');
});
```

[&laquo; Getting started](./get-started.md)

[Defines &raquo;](./defines.md)
