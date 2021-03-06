# Documentations

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Recommendations](#recommendations)
- [Requirements](#requirements)
- [Options](#options)
- [Comparison](#comparison)
- [Usage](#usage)
- [Hooks](#hooks)
- [Middlewares](#middlewares)
- [Handlers](#handlers)
- [Router](#router)
- [Request](#request)
- [Response](#response)
- [Docker](https://nanoexpress.js.org/docker-linux) `[E]`
- [Known bugs](#known-bugs)
- [IDE Support](#ide-support)
- [Benchmarks](./BENCHMARK.md) `[I]`

## Introduction

The Ultimate version is specially made for sponsors and includes a lot of re-writes than old codebase,
makes your code much stable. Includes new things such as

- Router finder & matcher
- Hooks
- Batches responses
- **express** API compatibility polyfill

and makes your development easier & cost-effective. It's fastest yet in **nanoexpress** family

---

## Installation

### npm

```shell
npm install nanoexpress/ultimate
# or
npm install nanoexpress/ultimate#v1.2.7
# or
npm install https://github.com/nanoexpress/ultimate/archive/refs/heads/master.zip
# or
npm install https://github.com/nanoexpress/ultimate/archive/refs/tags/v1.2.7.zip
```

---

## Recommendations

- Enabling `node --enable-source-maps` flag [1](https://stackoverflow.com/a/63125290/2538318) `[E]`
- Enabling `node --expose-gc` flag [2](https://stackoverflow.com/a/30654451/2538318) `[E]`
- Using **Ubuntu** (20.04+) image on **Docker** or on **host-machine** if possible

## Requirements

- Do not use **CentOS** or **Alpine** images on **Docker** or **host-machine** please

---

## Options

> Use either `https` or `http`, not both of them

| Name                         | Default   | Description                                                          |
| ---------------------------- | --------- | -------------------------------------------------------------------- |
| `https`                      | -         | Runs server with built-in HTTPS server with own configuration        |
| `http`                       | -         | Runs server with built-in HTTP server with own configuration         |
| `ignoreTrailingSlash`        | `true`    | Makes routes `/` slashes insensitive when enabled                    |
| `enableExpressCompatibility` | `false`   | Enables compatibility to **express** middlewares                     |
| `poolSize`                   | `10`      | Uses caching of instances to improve performance and optimize memory |
| `console`                    | `console` | Console instance, can be replaced logger                             |
| `json_spaces`                | -         | JSON encoding and making it prettifies                               |
| `json_replacer`              | -         | JSON and can be replaced from default `JSON.stringify` behavior      |
| `responseMode`               | `queue`   | Makes response batched (cork), immediate or queued                   |

---

## Comparison

### Between nanoexpress versions

| Feature           | nanoexpress | pro-slim             | ultimate             |
| ----------------- | ----------- | -------------------- | -------------------- |
| Performance       | Best        | Best                 | Better               |
| Stability         | Good        | Best                 | Better               |
| Express API       | Good        | Good                 | Better               |
| Caching           | -           | -                    | Best                 |
| Memory optimizer  | -           | -                    | Better               |
| Garbage Collector | -           | Better               | Better               |
| Dev Debugger      | -           | -                    | Available            |
| Hooks             | -           | -                    | Available            |
| Batching          | -           | -                    | Available            |
| Customizable      | Good        | -                    | Better               |
| Route Finder      | `v8.x`      | -                    | Better               |
| IDE Support       | Good        | Best                 | Better               |
| TypeScript        | Good        | Good                 | Better + Tools       |
| JSDoc comments    | -           | Best                 | Better               |
| Target user       | Anyone      | Commercial           | Enterprise           |
| Price             | Free        | Free for Open-Source | Free for Open-Source |
| License           | Apache-2.0  | GPL-3.0              | GPL-3.0              |

### Between frameworks

| Feature       | express    | nanoexpress | ultimate             |
| ------------- | ---------- | ----------- | -------------------- |
| Middlewares   | Better     | Good        | Best                 |
| Async routes  | -          | Good        | Better               |
| Validation    | Middleware | Middleware  | Middleware           |
| Serialization | Middleware | Middleware  | Middleware           |
| Swagger       | Middleware | Middleware  | Middleware           |
| Performance   | `1x`       | `6x`        | `8x`                 |
| Hooks         | -          | -           | Available            |
| TS+JSDoc      | Better     | Good        | Better + Tools       |
| Price         | Free       | Free        | Free for Open-Source |
| License       | MIT        | Apache-2.0  | GPL-3.0              |

---

## Usage

### ESM / TypeScript

```ts
import nanoexpress from '@nanoexpress/ultimate/esm';

const app = nanoexpress();

app.get('/', async () => {
  return { status: 'ok' };
});

await app.listen(8000);
```

### CJS

```js
const nanoexpress = require('@nanoexpress/ultimate');

const app = nanoexpress();

app.get('/', async () => {
  return { status: 'ok' };
});

app.listen(8000);
```

### Hook example

```ts
import nanoexpress, { useEffect } from '@nanoexpress/ultimate/esm';

const app = nanoexpress();

app.get('/', async (req) => {
  useEffect(() => {
    // this effect was initilized once for all connections
    // about memoize & caching don't worry
  }, []);

  useEffect(() => {
    console.log('logging user actions once by client id');
    // you can send server, initialize websocket or more actions
    // the hooks is similar to you seen in React library
  }, [req.headers['x-client-id']]);

  return { status: 'ok' };
});

await app.listen(8000);
```

---

## Hooks

| Name          | Description                     | Example                                                          |
| ------------- | ------------------------------- | ---------------------------------------------------------------- |
| `useEffect`   | Logic implementation hook       | `useEffect(() => console.log('router called'), [req.id])`        |
| `useMemo`     | Memorizing computational logics | `const result = useMemo(() => compute_something(1_000_000), [])` |
| `useCallback` | Handler memorizing              | `const runLogic = useCallback(() => do_logic(), [])`             |
| `useRef`      | Reference memorizing            | `const ref = useRef(null)`                                       |
| `useState`    | State management                | `const [state, setState] = useState(0)`                          |

---

## Middlewares

See [static serve](https://github.com/nanoexpress/middlewares/tree/master/packages/static) `[E]` middleware specially
built for **nanoexpress** family

or go [here](./MIDDLEWARES.md) `[I]` for more middlewares

---

## Handlers

- `app.setNotFoundHandler(req: HttpRequest, res: HttpResponse)`
- `app.setErrorHandler(error: Error, req: HttpRequest, res: HttpResponse)`

These handlers own default values, so you should not worry about setting them at starting code

## Router

The router class is almost same as **express** and does like **express** middleware layer stacking, finding & matching
happens inside **router finder** logic

To believe me see some example yourself

```js
import nanoexpress from '@nanoexpress/ultimate';

const app = nanoexpress();
const router = nanoexpress.Router();

app.use('/foo', router);

router.get('/', async () => {
  return { status: 'ok' };
});

await app.listen(8000);
// now go-to `http://localhost:8000/foo` and you should see json `{status: 'ok'}`
```

## Request

### Properties

- headers
- params
- query
- body

### Headers example

```js
app.get('/secret', (req) => {
  const { authorization } = req.headers;
});
```

### Params example

```js
app.get('/user/:id/login', async (req) => {
  const { id } = req.params;

  const result = await db.getUser(id);

  // do something...
});
```

### Query example

```js
// /user?token=123
app.get('/user', async (req) => {
  const { token } = req.query;

  const result = await jwt.verifyToken(token);

  // do something...
});
```

### Body example

```js
app.use(bodyParser());

app.post('/user', async (req) => {
  const { username, password } = req.body;

  // You can use db.createUser(req.body), but this may cause side-effects
  const result = await db.createUser({ username, password });

  // do something...
});
```

### Request Stream example

```js
app.use(bodyParser());

app.post('/user', async (req, res) => {
  req.pipe(res);
});
```

and now try request with body as some text content

### Cookies example

```js
app.use(bodyParser());
app.use(cookieParser());

app.post('/user', async (req) => {
  const { userId } = req.cookies;

  // You can use db.createUser(req.body), but this may cause side-effects
  const isUserLoggedIn = await dbHelper.checkUser(userId);

  // do something...
});
```

And [Upload](https://github.com/nanoexpress/middlewares/tree/master/packages/formidable) `[E]` example

---

## Response

### Cookie + JSON example

```js
app.get('/is_logged', async (req, res) => {
  const status = res.hasCookie('userId') ? 'success' : 'error';

  return res.send({ status });
});
```

### Redirect + Params example

```js
app.get('/user/:id/login', async (req, res) => {
  const { id } = req.params;

  const result = await db.getUser(id);

  return res.redirect(`/user/${id}/`);
});
```

### Response Stream example

```js
app.get('/user/:id/login', async (req, res) => {
  const file = fs.createReadStream('some_video.mp4');

  file.pipe(res);
  // or res.stream(file)
});
```

### sendFile

File should be on the same path where JS file is, or you can try **Absolute path** for **stream/sendFile**

```js
app.get('/video.mp4', async (req, res) => {
  return res.sendFile('video.mp4');
});
```

---

## Known bugs

- [HTTP Pipeline not working properly](https://github.com/nanoexpress/nanoexpress/issues/39) `[E]`
- If "Invalid access of discarded ..." happens, report ASAP to library author to get fix

---

## IDE Support

IDE Support was provided by TypeScript typings and JSDoc comments with source-mapping for improved debugging,
you should not worry about this
