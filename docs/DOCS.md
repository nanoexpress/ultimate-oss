# Documentations

## Table of Contents

- [Introduction](#Introduction)
- [Options](#Options)
- [Comparison](#Comparison)
- [Usage](#Usage)
- [Hooks](#Hooks)
- [IDE Support](#IDE%20Support)

## Introduction

The Ultimate version is specially made for sponsors and includes a lot re-writes than old codebase, makes your code much stable. Includes new things such as

- Router finder & matcher
- Hooks
- Batches responses
- **express** API compatibility polyfill

and makes your development easier & cost-effective. It's fastest yet in **nanoexpress** family

## Options

> Use either `https` or `http`, not both of them

| Name                         | Default   | Description                                                                        |
| ---------------------------- | --------- | ---------------------------------------------------------------------------------- |
| `https`                      | -         | Makes run server with built-in HTTPS server with own configuration                 |
| `http`                       | -         | Makes run server with built-in HTTP server with own configuration                  |
| `ignoreTrailingSlash`        | `true`    | Makes routes `/` slashesh insensitive when enabled                                 |
| `enableExpressCompatibility` | `false`   | Enables some functions internally to give compatibility to **express** middlewares |
| `poolSize`                   | `10`      | Internally uses caching of instances to improve performance and optimize memory    |
| `console`                    | `console` | Console instance, can be replaced logger                                           |
| `json_spaces`                | -         | Option used for json encoding and making it prettifier                             |
| `json_replacer`              | -         | Option used for json and can be replaced from default `JSON.stringify` behavior    |
| `responseMode`               | `queue`   | Makes response batched (cork), immediate or queued                                 |

## Comparison

### Between nanoexpress versions

| Feature           | nanoexpress | pro-slim   | ultimate        |
| ----------------- | ----------- | ---------- | --------------- |
| Performance       | Best        | Best       | Better          |
| Stability         | Good        | Best       | Better          |
| Express API       | Good        | Good       | Better          |
| Caching           | -           | -          | Best            |
| Memory optimizer  | -           | -          | Better          |
| Garbage Collector | -           | Better     | Better          |
| Dev Debugger      | -           | -          | Available       |
| Hooks             | -           | -          | Available       |
| Batching          | -           | -          | Available       |
| Customizable      | Good        | -          | Better          |
| Route Finder      | `v8.x`      | -          | Better          |
| IDE Support       | Good        | Best       | Better          |
| TypeScript        | Good        | Good       | Better + Tools  |
| JSDoc comments    | -           | Best       | Better          |
| Target user       | Anyone      | Commercial | Enterprise      |
| Price             | Free        | 5-50$/m    | 50$+/m per user |
| License           | Apache-2.0  | GPL-3.0    | Custom          |

### Between frameworks

| Feature       | express    | nanoexpress | ultimate        |
| ------------- | ---------- | ----------- | --------------- |
| Middlewares   | Better     | Good        | Best            |
| Async routes  | -          | Good        | Better          |
| Validation    | Middleware | Middleware  | Middleware      |
| Serialization | Middleware | Middleware  | Middleware      |
| Swagger       | Middleware | Middleware  | Middleware      |
| Performance   | `1x`       | `6x`        | `8x`            |
| Hooks         | -          | -           | Available       |
| TS+JSDoc      | Better     | Good        | Better + Tools  |
| Price         | Free       | Free        | 50$+/m per user |
| License       | MIT        | Apache-2.0  | Custom          |

### Usage

### ESM / TypeScript

```ts
import nanoexpress from 'nanoexpress/esm';

const app = nanoexpress();

app.get('/', async () => {
  return { status: 'ok' };
});

await app.listen(8000);
```

### CJS

```js
const nanoexpress = require('nanoexpress');

const app = nanoexpress();

app.get('/', async () => {
  return { status: 'ok' };
});

app.listen(8000);
```

### Hook example

```ts
import nanoexpress, { useEffect } from 'nanoexpress/esm';

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

## Hooks

| Name          | Description                   | Example                                                          |
| ------------- | ----------------------------- | ---------------------------------------------------------------- |
| `useEffect`   | Logic implementation hook     | `useEffect(() => console.log('router called'), [req.id])`        |
| `useMemo`     | Memoizing computitonal logics | `const result = useMemo(() => compute_something(1_000_000), [])` |
| `useCallback` | Handler memoizing             | `const runLogic = useCallback(() => do_logic(), [])`             |
| `useRef`      | Reference memoizing           | `const ref = useRef(null)`                                       |
| `useState`    | State management              | `const [state, setState] = useState(0)`                          |

## IDE Support

IDE Support was provided by TypeScript typings and JSDoc comments with source-mapping for improved debugging, you have do not worry about this
