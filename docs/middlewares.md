# Middlewares

> `nanoexpress Pro Slim` supports only `Async` middlewares.

## Examples

```js
app.use(async (req, res) => {
  req.myAsyncWork = await fetchMyThing(req);
});
```

## Legacy middlewares

> We mark Express/Connect middlewares as `legacy`
> We recomment upgrading to `async` middlewares as possible, but we keep backward compatible middleware layer

```js
import legacyConvert from 'nanoexpress/pro-slim/utils/legacy.js';
import expressMiddleware from '????';

const convertedExpressMiddleware = legacyConvert(expressMiddleware());

app.use(convertedExpressMiddleware);
```

## Method defining

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
