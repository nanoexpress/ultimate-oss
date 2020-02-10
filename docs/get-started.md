# Getting Started

Thanks for choosing `nanoexpress-pro-slim` as backend server

## Warning

- This library does not support HTTP2!
- This branch (PRO) is differs from master/dev branches
- This branch is paid for commercial products if sources are closed

## Install

### **Requires**: Node.js v12 or greater

### npm

```bash
npm install nanoexpress/pro-slim
```

### yarn

```bash
yarn add nanoexpress/pro-slim
```

## Let's create server

There few types of method defining, let me show you

- `app.get(req, res)`
- `app.post(req, res)`
- `app.put(req, res)`
- `app.patch(req, res)`
- `app.del(req, res)`
- `app.head(req, res)`
- `app.trace(req, res)`

Special route are

- `app.ws(req, ws)`
- `app.any(req, res)`
- `app.options(req, res)`

### Options

There has few options which you can configure

- `swagger: SwaggerObject` - Configures Swagger autodocumentation with your any schema for you
- `https: { key_file_name: string, cert_file_name: string }` - Option to enable SSL (https) mode
- `console: CustomConsole { log, error }` - Your custom console class object for nice-looking logs :)
- `json_spaces` - JSON.stringify 3-rd parameter

```js
import nanoexpress from 'nanoexpress-pro';
const app = nanoexpress();

app.get('/', async () => ({ hello: 'world' }));

app.listen(4000);
```

Caveats: Using `app.listen(PORT, '0.0.0.0')` is recommended for Docker, Heroku and AWS for compatibility.

### `app.use` example

```js
import nanoexpress from 'nanoexpress-pro';
const app = nanoexpress();

app.use(async (req, res) => {
  req.time = Date.now();
});

app.listen(4000);
```

[Middlewares &raquo;](./middlewares.md)
